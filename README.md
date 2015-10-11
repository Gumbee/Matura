# Matura

## Installation
##### Required:
* nodejs
* python-qt4
* bower
* Flask
* Flask-SQLAlchemy
* SQLAlchemy
* sqlalchemy-utils
* ghost.py

##### Steps:
1. Download Repository
2. Install dependencies

    ```
    cd <repositoryDirectory> && bower install
    ```
    
3. Create a file named config.py and place it inside the app directory. The config file should look like this

    ```
    weatherApiKey = 'yourWunderGroundApiKeyHere'
    secretKey = 'someSecretKeyHere'
    ```
    
4. Create a directory named 'databases' and one named 'ssl' and place them inside the app directory
5. Add your SSL certificate and key inside the ssl directory

## Instructions
If you are using port forwarding with 'chrome://inspect' you will have to check the 'port forwarding'-box on your app settings and have chrome opened on your mobile before scanning the QR-Code. 

For the google-feature and the weather-feature to work you will have to establish a internet connection on the machine, that is operating the site. For the calendar-feature however you will only have to have a internet connection on your mobile. 

## Further information
The app will not be distributed on Github and is only available through personal distribution.
