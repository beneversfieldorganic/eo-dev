import mysql.connector
import os

def get_conn():
    if os.path.isdir("/home/benmayo"):
        cnx = mysql.connector.connect(user='benmayo', password='pomag6hUUjf',
                                      host='127.0.0.1',
                                      database='organic')
    else:
        cnx = mysql.connector.connect(user='benmayo', password='pomag6hUUjf',
                                      host='51.104.52.61',
                                      database='organic')

    cur = cnx.cursor(buffered=True)

    return [cnx, cur]
