from db import get_connection


def insert_playlist(user_no: int, title: str, content: str = None) -> int:
    """플레이리스트 생성, 생성된 playlist_no 반환"""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = (
                "INSERT INTO playlist (user_no, title, content, created_at, updated_at)"
                " VALUES (%s, %s, %s, NOW(), NOW())"
            )
            cursor.execute(sql, (user_no, title, content))
            conn.commit()
            return cursor.lastrowid
    finally:
        conn.close()


def update_playlist(playlist_no: int, title: str, content: str = None) -> bool:
    """플레이리스트 수정, 성공 여부 반환"""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = (
                "UPDATE playlist SET title=%s, content=%s, updated_at=NOW()"
                " WHERE playlist_no=%s"
            )
            cursor.execute(sql, (title, content, playlist_no))
            conn.commit()
            return cursor.rowcount > 0
    finally:
        conn.close()


def delete_playlist(playlist_no: int) -> bool:
    """플레이리스트 삭제, 성공 여부 반환 (연결된 곡도 함께 삭제)"""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # 먼저 music_list에서 연결된 곡 삭제
            cursor.execute("DELETE FROM music_list WHERE playlist_no=%s", (playlist_no,))
            # 그 다음 플레이리스트 삭제
            cursor.execute("DELETE FROM playlist WHERE playlist_no=%s", (playlist_no,))
            conn.commit()
            return cursor.rowcount > 0
    finally:
        conn.close()


def find_by_playlist_no(playlist_no: int):
    """단건 조회"""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = "SELECT * FROM playlist WHERE playlist_no = %s"
            cursor.execute(sql, (playlist_no,))
            return cursor.fetchone()
    finally:
        conn.close()


def list_all_with_user():
    """전체 리스트 조회 (작성자 닉네임 포함)"""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = (
                "SELECT p.playlist_no, p.user_no, p.title, p.content,"
                " p.created_at, p.updated_at, u.nickname"
                " FROM playlist p LEFT JOIN user u ON p.user_no = u.user_no"
                " ORDER BY p.created_at DESC"
            )
            cursor.execute(sql)
            return cursor.fetchall()
    finally:
        conn.close()


def list_by_user_no(user_no: int):
    """특정 유저의 플레이리스트 목록 조회"""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = (
                "SELECT playlist_no, user_no, title, content, created_at, updated_at"
                " FROM playlist WHERE user_no = %s"
                " ORDER BY created_at DESC"
            )
            cursor.execute(sql, (user_no,))
            return cursor.fetchall()
    finally:
        conn.close()


def find_detail_with_user(playlist_no: int):
    """상세 조회 (작성자 닉네임 포함)"""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = (
                "SELECT p.playlist_no, p.user_no, p.title, p.content,"
                " p.created_at, p.updated_at, u.nickname"
                " FROM playlist p LEFT JOIN user u ON p.user_no = u.user_no"
                " WHERE p.playlist_no = %s"
            )
            cursor.execute(sql, (playlist_no,))
            return cursor.fetchone()
    finally:
        conn.close()


def get_genre_distribution(user_no: int):
    """사용자 플레이리스트의 장르 분포 조회"""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                SELECT g.name, COUNT(*) as count
                FROM playlist p
                JOIN music_list ml ON p.playlist_no = ml.playlist_no
                JOIN music m ON ml.music_no = m.music_no
                JOIN genre g ON m.genre_no = g.genre_no
                WHERE p.user_no = %s
                GROUP BY g.genre_no, g.name
                ORDER BY count DESC
            """
            cursor.execute(sql, (user_no,))
            return cursor.fetchall()
    finally:
        conn.close()


def get_user_audio_features(user_no: int):
    """사용자 플레이리스트 곡들의 평균 오디오 특성 조회"""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                SELECT
                    AVG(m.energy) as energy,
                    AVG(m.danceability) as danceability,
                    AVG(m.valence) as valence,
                    AVG(m.acousticness) as acousticness,
                    AVG(m.instrumentalness) as instrumentalness,
                    COUNT(*) as total_with_features
                FROM playlist p
                JOIN music_list ml ON p.playlist_no = ml.playlist_no
                JOIN music m ON ml.music_no = m.music_no
                WHERE p.user_no = %s
                  AND m.energy IS NOT NULL
            """
            cursor.execute(sql, (user_no,))
            return cursor.fetchone()
    finally:
        conn.close()


def get_weekly_activity(user_no: int):
    """사용자의 주간 활동 패턴 (플레이리스트 생성 + 곡 추가, 별도 집계)"""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            # 플레이리스트 생성 집계
            cursor.execute("""
                SELECT DAYOFWEEK(created_at) as day_num, COUNT(*) as cnt
                FROM playlist
                WHERE user_no = %s
                GROUP BY DAYOFWEEK(created_at)
            """, (user_no,))
            playlist_data = {row['day_num']: row['cnt'] for row in cursor.fetchall()}

            # 곡 추가 집계
            cursor.execute("""
                SELECT DAYOFWEEK(ml.added_at) as day_num, COUNT(*) as cnt
                FROM music_list ml
                JOIN playlist p ON ml.playlist_no = p.playlist_no
                WHERE p.user_no = %s AND ml.added_at IS NOT NULL
                GROUP BY DAYOFWEEK(ml.added_at)
            """, (user_no,))
            song_data = {row['day_num']: row['cnt'] for row in cursor.fetchall()}

            # 모든 요일에 대해 결과 생성 (1~7)
            result = []
            for day_num in range(1, 8):
                result.append({
                    'day_num': day_num,
                    'playlists': playlist_data.get(day_num, 0),
                    'songs': song_data.get(day_num, 0)
                })
            return result
    finally:
        conn.close()
