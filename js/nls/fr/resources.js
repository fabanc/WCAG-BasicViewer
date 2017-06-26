/*global define */
/*
 | Copyright 2014 Esri
 |
 | Licensed under the Apache License, Version 2.0 (the "License");
 | you may not use this file except in compliance with the License.
 | You may obtain a copy of the License at
 |
 |    http://www.apache.org/licenses/LICENSE-2.0
 |
 | Unless required by applicable law or agreed to in writing, software
 | distributed under the License is distributed on an "AS IS" BASIS,
 | WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 | See the License for the specific language governing permissions and
 | limitations under the License.
 */
define(
     ({
        "map": {
            "error": "Impossible de créer la carte"
        },
        "tools":{
            "search":{
                "error": "Emplacement introuvable",
                "notWhatYouWanted": "Ce n\'est pas ce que vous vouliez ?",
                "selectAnother": "Sélectionnez un autre emplacement",
                "currentLocation": "Emplacement actuel",
                "title": "Emplacement"
            },
	    	"print": {
			    "layouts":{
			      "label1": 'Paysage',
			      "label2": 'Portrait',
			      "label3": 'Paysage',
			      "label4": 'Portrait'
			    },
			    "legend": "Ajouter la légende à la sortie"
			},
			"share": {
				"extent": "Utiliser l’étendue courante de la carte",
				"label": "Partager cette carte",
				"link": "Lien de la carte",
				"facebook": "Facebook",
				"twitter": "Twitter"
			},
            "basemapGallery": {
                selected: "Carte de base sélectionnée"
            }
        },
        "tooltips":{
        	"home": "Etendue par Défaut",
        	"locate": "Rechercher mon Site",
        	"legend": "Légende",
        	"bookmarks": "Géosignets",
        	"layers": "Couches",
            "infoPanel" : "Panneau d'information",
        	"basemap": "Galerie des Cartes de Base",
        	"overview": "Vue Générale",
        	"measure": "Mesurer",
        	"edit": "Modifier",
        	"time": "Heure",
        	"print": "Imprimer",
        	"details": "Détails",
        	"share": "Partager",
            "filter": "Filtres",
            "features": "Liste des Caractéristiques"
        },
        "skip":{
            "tools" : "Aller au outils",
            "search" : "Aller à la recherche",
            "content" : "Aller au contenu",
            "splitter" : "Aller au séparateur d’écran",
            "map" : "Aller à la carte",
            "help" : "Aller à l’aide",
            "featureDetaills" : "Aller aux fonctionnalités détaillées"
        },
        "popupInfo" : {
            "Next":"Caractéristique suivante",
            "Prev":"Caractéristique précédente",
            "clickToSelect":"Cliquez sur la carte pour sélectionner des caractéristiques",
            "current":"Caractéristique actuelle",
            "total": "Le total du caractéristiques sélectionnées",
            "zoomTo": "Zoom sur caractéristique",
            "map": "Aller à la carte",
            "clear": "Effacer la sélection",
            "noFeatures": "Pas de caractéristiques"
        },
        search : "Recherche : ",
        searchPlaceholder: "Trouver une adresse ou un lieu",
        searchEnterCriteria : "Terme recherché pour",
        pressAlt : "Appuyer sur ALT + 0 à 7 pour naviguer rapidement",
        instructions:"instructions.french",
        wcagViewer : "Visualiseur Accessible"
    })
);
