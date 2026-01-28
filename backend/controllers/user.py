from flask import request, jsonify
from services import user as user_service
from model import playlist as playlist_model
from middleware.auth_utils import require_self_or_admin, require_auth

def get_profile(user_no):
    """프로필 조회 (본인 또는 ADMIN만 가능)"""
    # JWT 토큰 검증 및 권한 확인
    _, _, error_resp = require_self_or_admin(user_no)
    if error_resp:
        return error_resp

    user, error = user_service.get_profile(user_no)

    if error:
        return jsonify({"success": False, "message": error}), 404

    return jsonify({
        "success": True,
        "data": {
            "user_no": user["user_no"],
            "email": user["email"],
            "nickname": user["nickname"],
            "profile_url": user["profile_url"],
            "created_at": user["created_at"].isoformat() if user["created_at"] else None,
            "updated_at": user["updated_at"].isoformat() if user["updated_at"] else None
        }
    }), 200

def update_profile(user_no):
    """프로필 수정 (본인 또는 ADMIN만 가능)"""
    # JWT 토큰 검증 및 권한 확인
    _, _, error_resp = require_self_or_admin(user_no)
    if error_resp:
        return error_resp

    data = request.get_json()

    if not data or "nickname" not in data:
        return jsonify({"success": False, "message": "nickname 필드가 필요합니다."}), 400

    success, message = user_service.update_nickname(user_no, data["nickname"])

    if success:
        return jsonify({"success": True, "message": message}), 200
    else:
        return jsonify({"success": False, "message": message}), 400

def delete_account(user_no):
    """계정 탈퇴 (본인 또는 ADMIN만 가능)"""
    # JWT 토큰 검증 및 권한 확인
    _, _, error_resp = require_self_or_admin(user_no)
    if error_resp:
        return error_resp

    success, message = user_service.delete_account(user_no)

    if success:
        return jsonify({"success": True, "message": message}), 200
    else:
        return jsonify({"success": False, "message": message}), 400


def get_user_stats(user_no):
    """사용자 통계 조회 (장르 분포, 주간 활동, 음악적 특성)"""
    # JWT 토큰 검증
    _, _, error_resp = require_self_or_admin(user_no)
    if error_resp:
        return error_resp

    try:
        # 1. 장르 분포
        genre_data = playlist_model.get_genre_distribution(user_no)
        total_songs = sum(g['count'] for g in genre_data) if genre_data else 0
        genre_distribution = [
            {"name": g['name'], "value": round(g['count'] / total_songs * 100) if total_songs > 0 else 0}
            for g in genre_data
        ]

        # 2. 주간 활동 패턴 (플레이리스트 생성 + 곡 추가 별도)
        activity_data = playlist_model.get_weekly_activity(user_no)
        day_names = {1: '일', 2: '월', 3: '화', 4: '수', 5: '목', 6: '금', 7: '토'}
        activity_map = {a['day_num']: a for a in activity_data} if activity_data else {}
        weekly_activity = []
        for i in range(2, 8):  # 월~토
            data = activity_map.get(i, {'playlists': 0, 'songs': 0})
            weekly_activity.append({
                "day": day_names[i],
                "playlists": data.get('playlists', 0),
                "songs": data.get('songs', 0)
            })
        # 일요일
        data = activity_map.get(1, {'playlists': 0, 'songs': 0})
        weekly_activity.append({
            "day": day_names[1],
            "playlists": data.get('playlists', 0),
            "songs": data.get('songs', 0)
        })

        # 3. 음악적 특성 (Spotify API 실제 데이터 우선, 없으면 장르 기반 추정)
        db_audio = playlist_model.get_user_audio_features(user_no)

        if db_audio and db_audio.get('total_with_features', 0) > 0:
            # 실제 Spotify 오디오 특성 데이터 사용
            audio_features = {
                'energy': round(db_audio['energy'] or 50),
                'danceability': round(db_audio['danceability'] or 50),
                'valence': round(db_audio['valence'] or 50),
                'acousticness': round(db_audio['acousticness'] or 50),
                'instrumentalness': round(db_audio['instrumentalness'] or 50)
            }
        else:
            # 폴백: 장르 기반 추정값
            genre_features = {
                'K-Pop': {'energy': 80, 'danceability': 75, 'valence': 70, 'acousticness': 20, 'instrumentalness': 5},
                'Pop': {'energy': 70, 'danceability': 70, 'valence': 65, 'acousticness': 30, 'instrumentalness': 5},
                'Rock': {'energy': 85, 'danceability': 50, 'valence': 55, 'acousticness': 25, 'instrumentalness': 15},
                'Hip-Hop': {'energy': 75, 'danceability': 80, 'valence': 50, 'acousticness': 15, 'instrumentalness': 5},
                'Jazz': {'energy': 40, 'danceability': 45, 'valence': 55, 'acousticness': 70, 'instrumentalness': 30},
                'Electronic': {'energy': 85, 'danceability': 85, 'valence': 60, 'acousticness': 10, 'instrumentalness': 40},
                'Metal': {'energy': 95, 'danceability': 40, 'valence': 40, 'acousticness': 10, 'instrumentalness': 20},
            }
            audio_features = {'energy': 50, 'danceability': 50, 'valence': 50, 'acousticness': 50, 'instrumentalness': 50}
            if total_songs > 0:
                for feature in audio_features:
                    weighted_sum = sum(
                        genre_features.get(g['name'], {}).get(feature, 50) * g['count']
                        for g in genre_data
                    )
                    audio_features[feature] = round(weighted_sum / total_songs)

        return jsonify({
            "success": True,
            "data": {
                "genreDistribution": genre_distribution,
                "weeklyActivity": weekly_activity,
                "audioFeatures": audio_features
            }
        }), 200

    except Exception as e:
        return jsonify({"success": False, "message": str(e)}), 500