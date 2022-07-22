"use strict";
function getBooks(bookTitle) {
    var from = rxjs.from;
    var _a = rxjs.operators, switchMap = _a.switchMap, map = _a.map, tap = _a.tap; // tap per mostrare dati che ci stanno arrivando
    var apiUrl = "https://www.googleapis.com/books/v1/volumes?q=";
    /* chiamata fetch all'api di google */
    var p = fetch(apiUrl + bookTitle).then(function (res) { return res.json(); }); // promise con api fetch
    // per verificare se il then funziona
    // .then((books) => console.log(books))
    //);
    from(p)
        .pipe(switchMap(function (data) { return from(data.items || []); }), // trasformare gli items in una string ritornando gli elementi uno ad uno ||o array vuoto per non avere l'errore in caso non ci siano risultati per l'input di ricerca
    map(function (ele) {
        // filtrare alcuni elementi crendo un oggetto dall'interface Book
        var book = {
            title: ele.volumeInfo.title,
            categories: ele.volumeInfo.categories,
            authors: ele.volumeInfo.authors,
            description: ele.volumeInfo.description,
            thumbnail: ele.volumeInfo.imageLinks.thumbnail,
        };
        return book;
    })
    //tap((volumeInfo: VolumeInfo) => console.log(volumeInfo)) // verifica dati che arrivano in console
    )
        .subscribe(function (book) { return displayBook(book); });
}
function displayBook(book) {
    // mostrre a display
    var bookTpl = /*<div class="col"> commentato per fare append child */ "\n    <div class=\"card shadow-sm\">\n        <img src=\"" + book.thumbnail + "\" title=\"" + book.title + "\" alt=\"" + book.title + "\">\n      <div class=\"card-body\">\n        <h3 class=\"card-text\">\n          " + book.title + "\n        </h3>\n        <div\n          class=\"d-flex justify-content-between align-items-center\"\n        >\n          <div class=\"btn-group\">\n            <button\n              type=\"button\"\n              class=\"btn btn-sm btn-outline-secondary\"\n            >\n              View\n            </button>\n            <button\n              type=\"button\"\n              class=\"btn btn-sm btn-outline-secondary\"\n            >\n              Edit\n            </button>\n          </div>\n          <small class=\"text-muted\">9 mins</small>\n        </div>\n      </div>\n    </div>\n  </div>";
    var div = document.createElement("div");
    div.setAttribute("class", "col");
    div.innerHTML = bookTpl;
    var books = document.querySelector("#books");
    if (books) {
        books.appendChild(div);
    }
}
function cleanBooks() {
    var books = document.querySelector("#books");
    if (books) {
        books.innerHTML = "";
    }
}
function searchBooks() {
    // funz che scatena la chiamata creando un observable
    var fromEvent = rxjs.fromEvent;
    var _a = rxjs.operators, filter = _a.filter, map = _a.map, switchMap = _a.switchMap, debounceTime = _a.debounceTime, tap = _a.tap;
    var searchEle = document.querySelector("#search");
    if (searchEle) {
        fromEvent(searchEle, "keyup")
            .pipe(map(function (ele) { return ele.target.value; }), filter(function (ele) { return ele.length > 2; }), //per drezionare questa stinga a getBooks
        debounceTime(2000), // tempo di attesa prima del risultato del subscribe
        tap(cleanBooks()), // funz che pulisce Dom
        switchMap(function (ele) { return getBooks(ele); }) //ridezionare questa stringa all'altro observable getbooks
        )
            .subscribe(function (book) { return displayBook(book); });
    }
}
searchBooks();
