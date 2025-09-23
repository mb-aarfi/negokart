import sqlite3
conn = sqlite3.connect('test.db')
cur = conn.cursor()
cur.executescript('''
PRAGMA foreign_keys=OFF;
DELETE FROM offers;
DELETE FROM chat_messages;
DELETE FROM wholesaler_negotiations;
DELETE FROM wholesaler_history;
DELETE FROM negotiation_sessions;
DELETE FROM product_lists;
VACUUM;
''')
conn.commit()
print('sessions_cleared')