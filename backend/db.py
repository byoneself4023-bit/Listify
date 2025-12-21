import pymysql
import os
from dotenv import load_dotenv
from dbutils.pooled_db import PooledDB

class DatabaseManager:
    """싱글톤 패턴의 DB Connection Pool 관리자"""
    _pool = None
    _initialized = False
    
    @classmethod
    def get_pool(cls):
        if cls._pool is None:
            cls._pool = PooledDB(
                creator=pymysql,
                maxconnections=10,
                mincached=2,
                maxcached=5,
                blocking=True,
                host=os.getenv('DB_HOST', 'localhost'),
                port=int(os.getenv('DB_PORT', 3306)),
                user=os.getenv('DB_USER', 'root'),
                password=os.getenv('DB_PASSWORD', ''),
                database=os.getenv('DB_DATABASE', 'listify'),
                cursorclass=pymysql.cursors.DictCursor,
                autocommit=False
            )
            if not cls._initialized:
                print("✅ DB Connection Pool 생성 완료")
                cls._initialized = True
        return cls._pool
    
    @classmethod
    def get_connection(cls):
        """Connection Pool에서 연결 가져오기"""
        return cls.get_pool().connection()


def get_connection():
    """외부에서 사용할 통합 연결 함수"""
    return DatabaseManager.get_connection()


# 기존 호환성 유지용 함수 (deprecated)
def connect_to_mysql(host, port, user, password, database):
    """
    [DEPRECATED] 기존 연결 함수 - 호환성 유지용
    새 코드에서는 get_connection() 사용 권장
    """
    return get_connection()


if __name__ == '__main__':
    conn = get_connection()
    if conn:
        try:
            with conn.cursor() as cursor:
                cursor.execute("SELECT VERSION()")
                result = cursor.fetchone()
                print(f"MariaDB 버전: {result}")
        except pymysql.MySQLError as e:
            print(f"데이터베이스 작업 오류: {e}")
        finally:
            conn.close()
            print("연결 반환됨 (Pool)")
