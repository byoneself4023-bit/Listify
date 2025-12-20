# seed_music.py - Spotify API를 사용한 music 테이블 테스트 데이터 삽입
import os
import spotipy
from spotipy.oauth2 import SpotifyClientCredentials
from dotenv import load_dotenv
from db import connect_to_mysql

load_dotenv()

# Spotify 클라이언트 설정
sp = spotipy.Spotify(auth_manager=SpotifyClientCredentials(
    client_id=os.getenv('SPOTIFY_CLIENT_ID'),
    client_secret=os.getenv('SPOTIFY_CLIENT_SECRET')
))

# DB 연결
def get_conn():
    return connect_to_mysql(
        os.getenv("DB_HOST"),
        int(os.getenv("DB_PORT")),
        os.getenv("DB_USER"),
        os.getenv("DB_PASSWORD"),
        os.getenv("DB_DATABASE")
    )

# 장르별 검색 키워드 (다양한 음악 수집)
SEARCH_QUERIES = [
    ("K-pop", 15),      # K-pop 15곡
    ("Pop", 15),        # Pop 15곡
    ("Hip hop", 10),    # Hip hop 10곡
    ("R&B", 10),        # R&B 10곡
    ("Rock", 10),       # Rock 10곡
    ("Jazz", 5),        # Jazz 5곡
    ("Electronic", 5),  # Electronic 5곡
]

def get_or_create_genre(conn, genre_name):
    """장르 번호 조회 (없으면 생성)"""
    with conn.cursor() as c:
        c.execute("SELECT genre_no FROM genre WHERE name = %s", (genre_name,))
        row = c.fetchone()
        if row:
            return row['genre_no']
        
        # 장르 생성
        c.execute("INSERT INTO genre (name) VALUES (%s)", (genre_name,))
        conn.commit()
        return c.lastrowid

def fetch_tracks_from_spotify(query, limit):
    """Spotify에서 트랙 검색"""
    results = sp.search(q=query, type='track', limit=limit, market='KR')
    tracks = []
    
    for item in results['tracks']['items']:
        tracks.append({
            'track_name': item['name'],
            'artist_name': ', '.join([a['name'] for a in item['artists']]),
            'album_name': item['album']['name'],
            'album_image_url': item['album']['images'][0]['url'] if item['album']['images'] else None,
            'duration_ms': item['duration_ms'],
            'popularity': item['popularity'],
            'spotify_url': item['external_urls']['spotify']
        })
    
    return tracks

def insert_music(conn, music_data, genre_no):
    """음악 데이터 삽입 (중복 체크)"""
    with conn.cursor() as c:
        # 중복 체크
        c.execute("SELECT music_no FROM music WHERE spotify_url = %s", (music_data['spotify_url'],))
        if c.fetchone():
            print(f"  ⏭️  중복 스킵: {music_data['track_name']}")
            return False
        
        sql = """
        INSERT INTO music 
        (track_name, artist_name, album_name, album_image_url, duration_ms, popularity, spotify_url, genre_no)
        VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
        """
        c.execute(sql, (
            music_data['track_name'],
            music_data['artist_name'],
            music_data['album_name'],
            music_data['album_image_url'],
            music_data['duration_ms'],
            music_data['popularity'],
            music_data['spotify_url'],
            genre_no
        ))
        conn.commit()
        print(f"  ✅ 저장: {music_data['track_name']} - {music_data['artist_name']}")
        return True

def main():
    print("🎵 Spotify 음악 데이터 삽입 시작...")
    print("=" * 50)
    
    conn = get_conn()
    if not conn:
        print("❌ DB 연결 실패")
        return
    
    total_inserted = 0
    
    try:
        for genre_name, count in SEARCH_QUERIES:
            print(f"\n📂 [{genre_name}] {count}곡 수집 중...")
            
            # 장르 번호 가져오기/생성
            genre_no = get_or_create_genre(conn, genre_name)
            
            # Spotify에서 트랙 가져오기
            tracks = fetch_tracks_from_spotify(genre_name, count)
            
            for track in tracks:
                if insert_music(conn, track, genre_no):
                    total_inserted += 1
                
                # 70개 도달 시 종료
                if total_inserted >= 70:
                    break
            
            if total_inserted >= 70:
                break
    
    finally:
        conn.close()
    
    print("\n" + "=" * 50)
    print(f"🎉 완료! 총 {total_inserted}개 음악 데이터 삽입됨")

if __name__ == "__main__":
    main()
