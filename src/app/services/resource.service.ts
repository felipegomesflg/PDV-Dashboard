
export var resource = { //NÃO MUDAR AS KEYS, MUDAR APENAS QUANDO FOR FAZER GRANDE MANUTENÇÃO NO CODIGO QUE A UTILIZA, MUDANÇA MUITO SUCETIVEL A BUGS
    'pt-br':
        {
        menu: [
            { name: 'Dashboard', routerLink: '/sales', icon: 'fa fa-dollar', role: "1,2,3,4,5"},
            { name: 'Sales', routerLink: '/sales', icon: 'fa fa-user-circle', role: "1,2,3,4,5" },
            { name: 'Items', routerLink: '/items', icon: 'fa fa-home', role: "12,3,4,5",
            title:{
                detail:"Detalhes",
                priceInventory:"Preço e Inventário"
            },
            label:{
                name:"Nome",
                category: "Categoria",
                description: "",
                location:"Lojas",
                taxes: "Taxas",
                price:"Valor",
                cost:"Preço de Custo",
                SKU:"SKU",
                stock:"Estoque",
                lowStock:"Alerta de Estoque",
            }
             },
            { name: 'Employees', routerLink: '/users', icon: 'fa fa-beer', role: "1,2,3,4,5" },
            { name: 'Customers', routerLink: '/users', icon: 'fa fa-beer', role: "1,2,3,4,5" },
            { name: 'separador', role: "1,2,3,4,5" },
            { name: 'Account & Settings', routerLink: '/profiles/', icon: 'fa fa-cube', role: "1,2,3,4,5" },
            //{ label: 'Promoções', routerLink: '/event-sales/', icon: 'fa fa-money',role:"1,3,4,5"}
            ]
    },
    'en-us':{}

}
