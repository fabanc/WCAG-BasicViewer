define({
    widgets: ({
        popupInfo: ({
            "Next":"Caractéristique suivante",
            "Prev":"Caractéristique précédente",
            "clickToSelect":"Cliquez sur la carte pour sélectionner des caractéristiques",
            "current":"Caractéristique actuelle",
            "total": "Le total du caractéristiques sélectionnées",
            "zoomTo": "Zoom sur caractéristique",
            "map": "Aller à la carte",
            "clear": "Effacer la sélection",
            "noFeatures": "Pas des caractéristiques",
            "instructions" : 
                "Cliquez sur la carte pour sélectionner des caractéristiques, <br/>ou <br/>"+
                "<a href='#' onclick='dojo.byId(\"mapDiv\").focus();'>Aller à la carte</a> et:"+
                "<ul>"+
                "<li>déplacer la carte avec <myKey>flèches</myKey>, ou</li>"+
                "<li>déplacer le curseur de carte avec <myKey>MAJ</myKey> + <myKey>flèches</myKey>, puis</li>"+
                "<li>appuyez sur <myKey>Entrée</myKey> pour sélectionner au curseur,</li>"+
                "<li>appuyez <myKey>MAJ</myKey> + <myKey>Entrée</myKey> pour sélectionner au curseur (x 10),</li>"+
                "<li>appuyez <myKey aria-label='Contrôle'>CTRL</myKey> + <myKey>Entrée</myKey> pour sélectionner toute dans l'étendue de la carte,</li>"+
                "<li>appuyez <myKey aria-label='Contrôle'>CTRL</myKey> + <myKey>MAJ</myKey> + <myKey>Entrée</myKey> pour sélectionner l'intérieur de la caractéristique sélectionnée.</li>"+
                "</ul>"+
                "En sélectionnant l'étendue, commence le mode 'Suivre la Carte'.",
            "followTheMap": "Mode Suivez la carte"
        })
    })
});
