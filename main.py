import requests
import json
import time
from apps_info import apps as apps_list
from bs4 import BeautifulSoup
import addtodb

release_info = []

for app in apps_list:
    name = app['name']
    id = app['id']
    url = 'https://apps.apple.com/cn/app/' + id         #app url
    strhtml = requests.get(url)
    soup = BeautifulSoup(strhtml.text, 'html5lib')
                            #去除年龄限制
    age = soup.select(
        '#ember-app > div > main > div.animation-wrapper.is-visible > section.l-content-width.section.section--hero.product-hero > div > div.l-column.small-7.medium-8.large-9.small-valign-top > header > h1 > span')
    age[0].clear()
    # app_name = soup.select(
    #     '#ember-app > div > main > div.animation-wrapper.is-visible > section.l-content-width.section.section--hero.product-hero > div > div.l-column.small-7.medium-8.large-9.small-valign-top > header > h1')
    #
    item = {}
    # item['name'] = app_name[0].get_text().strip()
    item['name'] = name
    item['id']=id[2:]
    item['releases'] = []
    vers = soup.find('script', {'id': 'shoebox-ember-data-store'})
    vers_json = json.loads(vers.get_text())
    for user in vers_json[id[2:]]['included']:
        if user['id'] == id[2:] + '-ios':
            item['releases'] = user['attributes']['versionHistory']
            break

    release_info.append(item)
    time.sleep(0.5)

with open('versions_info.json', 'w',encoding='utf-8') as f:
    json.dump(release_info, f, ensure_ascii=False)

addtodb.insert()


