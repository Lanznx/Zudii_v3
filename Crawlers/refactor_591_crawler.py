from selenium.webdriver.chrome.options import Options
from selenium import webdriver
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.by import By
from dotenv import dotenv_values, load_dotenv
import pymongo
from bs4 import BeautifulSoup
from datetime import datetime, timedelta, date

def initialize_webdriver(chrome_path):
    options = Options()
    options.add_argument("--disable-extensions")
    options.add_argument("--disable-alerts")
    options.add_argument("--disable-notifications")
    options.add_argument("--disable-popups")
    options.add_argument("--disable-gpu")
    chrome = webdriver.Chrome(chrome_path, options=options)
    return chrome

def initialize_mongodb_connection(mongo_connection):
    client = pymongo.MongoClient(mongo_connection)
    db = client.test
    collection = db.prod_591
    return client, collection

def get_batch_num(collection):
    try:
        batch_num = collection.find().sort("batch", pymongo.DESCENDING)[0]
        batch_num = batch_num['batch'] + 1
    except:
        batch_num = 0
    return batch_num

def get_resources(chrome, section, firstRow):
    chrome.get("https://rent.591.com.tw/?region=1&section={}&order=posttime&orderType=desc&firstRow={}".format(section, str(firstRow)))
    WebDriverWait(chrome, 10000).until(EC.presence_of_element_located((By.CLASS_NAME, "R")))
    soup = BeautifulSoup(chrome.page_source, 'html.parser')
    return soup

def extract_post_details(chrome, post, batch_num, collection, section):
    postNumber = 0
    content = {
        "id_591": "",
        "imgLink": "",
        "title": "",
        "link": "",
        "section": section,
        "position": {"type": "Point", "coordinates": []},
        "locationLink": "",
        "release_time": "",
        "location": "",
        "price": "",
        "type": "",
        "size": "",
        "batch": batch_num
    }
    
    id_591 = post['data-bind']

    if(collection.find_one({"id_591": int(id_591)}) == None):
        try:
            imgLink = post.find_all("img", {"class": "obsever-lazyimg"})[0]['data-original']
        except:
            imgLink = ""
        # process post details here, including title, link, location, price, type, size etc.
        # get release time & position
        chrome.get(link)
        WebDriverWait(chrome, 10000).until(EC.presence_of_element_located((By.CLASS_NAME, 'google-maps-link')))
        soup = BeautifulSoup(chrome.page_source, "html.parser")
        locationLink = soup.find("a", {'class': "google-maps-link"})['href']
        latitude = locationLink.split("&q=")[1].split(',')[0]
        longitude = locationLink.split("&q=")[1].split(",")[1].split("&z=")[0]
        
        # calculate release time 
        release_time_tag = soup.find("div", {"class", "release-time"})
        release_time_texts = [t for t in release_time_tag.find_all(text=True)]
        release_time = calculate_release_time(release_time_texts)
        
        content.update({"id_591": int(id_591)})
        content.update({"title": title})
        content.update({"imgLink": imgLink})
        content.update({"link": link})
        content.update({"location": location})
        content.update({"price": int(price)})
        content.update({"type": type})
        content.update({"size": size})
        content.update({"locationLink": locationLink})
        content.update({"position": {"type": "Point", "coordinates": [float(longitude), float(latitude)]}})
        content.update({"release_time": release_time})
        
        try:
            collection.insert_one(content)
            print(content["id_591"], " inserted")
        except Exception as e:
            print(e)
            raise e

        postNumber += 1
    else:
        print(id_591, "already exist")
        postNumber += 1
        pass


def calculate_release_time(release_time_texts):
    for release_time_text in release_time_texts:
        if ("剛剛" in release_time_text or "小時" in release_time_text or "分鐘" in release_time_text):
            release_time = datetime.today().strftime('%Y-%m-%d')
            break
        elif ("天" in release_time_text):
            release_time_text = release_time_text.replace(" ", "")
            release_time = (datetime.today() - timedelta(days=int(release_time_text[5:6]))).strftime('%Y-%m-%d')
            break
        elif ("月" in release_time_text):
            release_time_text = release_time_text.replace(" ", "")
            month = release_time_text.split("在")[1].split("月")[0]
            day = release_time_text.split("月")[1].split("日")[0]
            if(int(month) <= datetime.now().month):
                release_time = str(date(int(datetime.today().strftime('%Y')), int(month), int(day)))
            else:
                release_time = str(date(int(datetime.today().strftime('%Y')) - 1, int(month), int(day)))
            break
    return release_time


def main():
    ENV_PATH = "./.env"
    MONGO_CONNECTION = dotenv_values(ENV_PATH)["MONGO_CONNECTION"]
    CHROME_PATH = dotenv_values(ENV_PATH)["CHROME_PATH"]

    chrome = initialize_webdriver(CHROME_PATH)
    client, collection = initialize_mongodb_connection(MONGO_CONNECTION)
    batch_num = get_batch_num(collection)

    for section in range(1, 13):
        has_next_page = True
        firstRow = 0
        try:
            while(has_next_page):
                soup = get_resources(chrome, section, firstRow)
                posts = soup.find_all('section', {'class': 'vue-list-rent-item'})
                total_rows = soup.find("span", {"class": "R"}).text
                print(total_rows)
                for post in posts:
                    extract_post_details(chrome, post, batch_num, collection, section)
                if(firstRow >= int(total_rows)):
                    has_next_page = False
                else:
                    firstRow += 30
        except Exception as e:
            print("error in section {}, row {}".format(section, firstRow))
            print(e)
            pass

    collection.update_many({}, [{'$addFields': {'converted_time': {'$toDate': '$release_time'}}}])
    client.close()
    print("Closed connection to MongoDB")

if __name__ == "__main__":
    main()
