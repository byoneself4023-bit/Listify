from db import get_connection
import os


def find_by_user_no(user_no):
    """user_no로 유저 조회"""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                SELECT user_no, role_no, email, nickname, profile_url, created_at, updated_at
                FROM user
                WHERE user_no = %s AND is_deleted = FALSE
            """
            cursor.execute(sql, (user_no,))
            return cursor.fetchone()
    finally:
        conn.close()


def update_nickname(user_no, nickname):
    """닉네임 수정"""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                UPDATE user
                SET nickname = %s
                WHERE user_no = %s AND is_deleted = FALSE
            """
            cursor.execute(sql, (nickname, user_no))
            conn.commit()
            return cursor.rowcount > 0
    finally:
        conn.close()


def soft_delete(user_no):
    """계정 탈퇴 (soft delete)"""
    conn = get_connection()
    try:
        with conn.cursor() as cursor:
            sql = """
                UPDATE user
                SET is_deleted = TRUE
                WHERE user_no = %s AND is_deleted = FALSE
            """
            cursor.execute(sql, (user_no,))
            conn.commit()
            return cursor.rowcount > 0
    finally:
        conn.close()