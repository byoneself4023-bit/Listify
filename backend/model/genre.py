from db import get_connection


def find_genre_no_by_name(name):
    conn = get_connection()
    try:
        with conn.cursor() as c:
            c.execute("SELECT genre_no FROM genre WHERE name = %s", (name,))
            row = c.fetchone()
            return row["genre_no"] if row else None
    finally:
        conn.close()