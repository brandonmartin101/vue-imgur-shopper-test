new Vue({
    el: "#app",
    data: {
        total: 0,
        items: [],
        cart: [],
        results: [],
        newSearch: "the west wing", //default search
        lastSearch: "",
        loading: true
    },
    computed: {
        noMoreItems: function() {
            return this.items.length === this.results.length && this.results.length > 0;
        }
    },
    methods: {
        appendItems: function() {
            console.log("entered viewport",this.items.length,this.results.length);
            if (this.items.length < this.results.length) {
                var append = this.results.slice(this.items.length,this.items.length+10);
                console.log(append);
                this.items = this.items.concat(append);
                for (var i = this.items.length-10; i < this.items.length; i++ ) {
                    this.items[i].price = Math.round(this.items[i].downs)/100;
                    this.items[i].url = "http://www.imgur.com/gallery/"+this.items[i].id;
                }
            }
        },
        formSubmit: function() {
            if (!this.newSearch.length) return;
            this.lastSearch = this.newSearch;
            this.items = [];
            this.loading = true;
            this.$http.get('/search/'+this.newSearch).then(function(res) {
                this.results = res.data;
                this.appendItems();
                this.loading = false;
            });
            this.newSearch = "";
        },
        addItem: function(index,item){
            this.total += item.price;
            // check cart to see if item is already included
            var found = false;
            for (var i = 0; i < this.cart.length; i++) {
                if (this.cart[i].id === item.id) {
                    found = true;
                    this.cart[i].qty++;
                    break;
                }
            }
            if (!found) {
                this.cart.push({
                    id: item.id,
                    title: item.title,
                    price: item.price,
                    qty: 1
                });
            }
        },
        inc: function(item) {
            item.qty++;
            this.total += item.price;
        },
        dec: function(item) {
            item.qty--;
            this.total -= item.price;
            // remove from cart of qty is zero
            if (!item.qty) {
                for (var i = 0; i < this.cart.length; i++) {
                    if (this.cart[i].id === item.id) {
                        this.cart.splice(i,1);
                        break;
                    }
                }
            }
        }
    },
    filters: {
        currency: function(price) {
            try {
                return "$" + price.toFixed(2);
            } catch(e) {
                return price;
            }
        }
    },
    mounted: function() {
        // runs on app load
        this.formSubmit();
        
        // watches for infinite scrolling
        var watcher = scrollMonitor.create(document.getElementById("product-list-bottom"));
        // this line is just to give access to this to watcher
        var vueInstance = this;
        watcher.enterViewport(function() {
            vueInstance.appendItems();
        });
    }
});