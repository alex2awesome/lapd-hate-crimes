from concurrent.futures import ThreadPoolExecutor, ProcessPoolExecutor
import requests
import sys
from selenium import webdriver
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from bs4 import BeautifulSoup, Tag
import os

show_tables = "SELECT name FROM sqlite_master WHERE type='table';"
show_columns = "SELECT name FROM PRAGMA_TABLE_INFO('%s');"

def get_url(url, dom=None, retries=float('inf')):
    if dom:
        url = dom + url
    try:
        return requests.get(url)
    except:
        if retries == 0:
            print('timed out')
            return url
        return get_url(url, retries=retries-1)



def multiprocess(input_list, func, num_workers=2):
    """Simple ThreadPoolExecutor Wrapper.

        Input_list: list to be mapped over by the executor.
        func: function to be mapped.

        returns output of the function over the list.

        Code:
            with ThreadPoolExecutor(max_workers=2) as executor:
                for output in executor.map(func, input_list):
                    yield output
    """
    with ThreadPoolExecutor(max_workers=num_workers) as executor:
        for output in executor.map(func, input_list):
            yield output


import numpy as np
emails = [
    "alex2awesome@gmail.com",
    "alvivianspangher@aol.com", 
    "alex3awesome@gmail.com",
    "alex4awesome@gmail.com",
    "alex5awesome@gmail.com"
]
def unpaywall(doi, retry=0, pdfonly=False):
    email = np.random.choice(emails)
    try:
        r = requests.get("https://api.unpaywall.org/v2/{}".format(doi), params={"email":email})
    except:
        if retry < 3:
            return unpaywall(doi, retry+1)
        else:
            print("Retried 3 times and failed. Giving up")
            return None

    ## handle unpaywall API 
    if r.status_code == 404:
        print("Invalid/unknown DOI {}".format(doi))
        return None
    if r.status_code == 500:
        print("Unpaywall API failed. Try: {}/3".format(retry+1))
        if retry < 3:
            return unpaywall(doi, retry+1)
        else:
            print("Retried 3 times and failed. Giving up")
            return None

    try:
        results = r.json()
    except json.decoder.JSONDecodeError:
        print("Response was not json")
        return r.text
   
    return results


def selenium_get(link, headless=True):
    """Scrape webpage using selenium Chrome.
    
    Returns: 
        link, html
    """
    try:
        options = webdriver.ChromeOptions()
        if headless:
            options.add_argument("headless")
        if 'win' in sys.platform:
            driver = webdriver.Chrome('C:/Users/alex2/chromedriver.exe', options=options)
        else:
            driver = webdriver.Chrome("/mnt/c/Users/alex2/chromedriver.exe", options=options)
            
        driver.implicitly_wait(1)
        driver.get(link)
        return link, driver.page_source
    except:
        return link, ""
    

def clean_me(html):
    if not isinstance(html, (Tag, BeautifulSoup)):
        html = BeautifulSoup(html, 'lxml')
    for s in html(['script', 'style']):#, 'meta', 'noscript']):
        s.decompose()
    return ' '.join(html.stripped_strings)



import spacy
nlp = spacy.load('en_core_web_lg')
import re
import nltk.corpus
import unidecode

page_num_regex = re.compile('\s[a-f]\d+(\s|$)')
specific_stop_words = [
    'article',
    'page',
    'sportsmonday',
    'sportstuesday',
    'sportswednesday',
    'sportsthursday',
    'sportsfriday',
    'sportssaturday',
    'sportssunday',
    'times',
    'caption',
    'science times',
    'business day',
    'editing error page',
    'ap sports',
    'ap',
    'reuters',
    'op ed contributor',
    'books times',
    'music review',
    'op ed',
    'sports times',
    'articles , pages',
    'articles pages',
    'special today',
    'science f1',
    'art review',
    'television review',
    'articles series',
    'ed contributor',
    'news briefs',
    'articles series',
    'news analysis',
    'sports people',
    'company news',
    'metro : new york',
    'metro : new jersey',
    'metro : new york city',
    'metro : new york state',
    'lead : editor',
    'op - ed',
    'company reports',
    'dance review',
    'theater review',
    'public lives',
    'world business , section w',
    'world business briefing : europe',
    'world business briefing : asia',
    'world business briefings : middle east',
    'world business briefing : africa',
    'world business briefing : americas',
    'world business briefings : europe',
    'world business briefings : asia',
    'world business briefing : world trade',
    'nytimes',
    'www',
    'nyt'
]

english_stopwords = [item.strip('\n') for item in nltk.corpus.stopwords.open('english')]
stopwords = specific_stop_words + english_stopwords
  
def preprocess_lite(body, remove_numbers=True, remove_punc=True):
    """preprocess without spacy."""
    body = body.strip()
    
    ### replace stopwords
    for stopword in stopwords:
        ## stopword in body
        body = body.replace(' ' + stopword + ' ', ' ')
        ## stopword at start
        if body[:len(stopword + ' ')] == (stopword + ' '):
            body = body[len(stopword + ' '):]
        ## stopword at end
        if body[-len(' ' + stopword):] == (' ' + stopword):
            body = body[:-len(' ' + stopword)]
        
        
    ### replace page numbers
    body = re.sub(page_num_regex, ' ', body)
    if remove_numbers:
        body = re.sub('\d+', ' ', body)
    if remove_punc:
        for p in '!"#$%&()*+,-./:;<=>?@[\\]^_`{|}~':
            body = body.replace(p, '')
        body = body.replace("''", '')

    return unidecode.unidecode(body)

def preprocess(body):
    """preprocess with spacy."""
    try:
        ### spacy split
        text = body.split()
        text = ' '.join(text)
        doc = nlp(text)
        text = [word.text for word in doc]
        body = ' '.join(text).replace('\' \'', '"')

        ### other cleanup
        body = body.lower()
        return preprocess_lite(body)
    except:
        return ''