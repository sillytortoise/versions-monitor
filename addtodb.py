import pymysql
import json

# import re

host = 'localhost'
port = 3306
db = 'sys'
user = 'root'
pwd = ''


def isindb(cursor, id, ver):
    sql = "select ver from versions where bank_id='%s' and ver='%s'" % (id, ver)
    cursor.execute(sql)
    results = cursor.fetchall()
    if len(results) == 0:
        return False
    return True


def getconn():
    conn = pymysql.connect(host=host, port=port, db=db, user=user, password=pwd)
    return conn


def insert():
    conn = getconn()
    cursor = conn.cursor(pymysql.cursors.DictCursor)
    cursor.execute('use sys')
    try:
        with open('versions_info.json', 'r', encoding='utf-8') as f:
            apps = json.load(f)
            insert_sql = "INSERT IGNORE INTO versions (bank_name, bank_id, ver, update_time, feature) VALUES('%s','%s','%s','%s','%s');"
            for app in apps:
                bank_name = app['name']
                bank_id = app['id']
                for version in app['releases']:
                    ver = version['versionDisplay']
                    update_time = version['releaseDate']
                    if isindb(cursor, bank_id, ver):
                        break
                    features = version["releaseNotes"].split('\n')
                    # pattern = '[1-9][0-9]*、'  # 匹配以数字序号开头的
                    for feature in features:
                        # if re.match(pattern, feature) is not None:
                        if feature != '':
                            cursor.execute(insert_sql % (bank_name, bank_id, ver, update_time, feature))
                        # print(insert_sql % (bank_name, bank_id, ver, update_time, feature))
        conn.commit()
    except:
        cursor.close()
        conn.rollback()

    finally:
        cursor.close()
        conn.close()


if __name__ == '__main__':
    print('----done')
    insert()
