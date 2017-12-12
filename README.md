# Planiz-website
INSA-5TC Innovative project

## Prerequis

### Plugins NodeJS

Executer la commande dans le dossier du projet:
```
$ npm install
```

### MongoDB

- Installer MongoDB
- Lancer mongod (mongod.exe pour Windows)
- Lancer mongo (mongo.exe) pour créer la bdd et la collection Planiz:
```
> use bdd_planiz
> db.planiz.insert({"name":"test"})
```

## Lancement

Executer bin/www

Aller sur http://localhost:3000 pour voir les résultats
