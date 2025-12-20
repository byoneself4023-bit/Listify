from db import get_connection

conn = get_connection()
c = conn.cursor()

tables = ['music', 'music_list', 'playlist', 'genre', 'user', 'role', 'notice']

with open('schema_output.txt', 'w', encoding='utf-8') as f:
    for table in tables:
        f.write(f'\n=== {table} ===\n')
        c.execute(f'DESCRIBE {table}')
        for row in c.fetchall():
            f.write(f"  {row['Field']:25} {row['Type']:25} {row['Key']:5} {row['Extra']}\n")
        
        # Sample data
        c.execute(f'SELECT * FROM {table} LIMIT 2')
        rows = c.fetchall()
        if rows:
            f.write(f"  --- Sample Data ---\n")
            for row in rows:
                f.write(f"  {row}\n")

conn.close()
print('Schema saved to schema_output.txt')
