declare const rxjs: any; // indicare a tpescript cosa è rxjs per evitare errore (se diciamo che è obj ci da errore perchè non riconosce i metodi)

interface GoogleBooks {
  items: number;
  kind: string;
  descriptionitems: [];
}
interface BookThumbnails {
  smallThumbnail: string;
  thumbnail: string;
}
interface BookItem {
  volumeInfo: VolumeInfo;
  id: string;
}
interface VolumeInfo {
  categories: [];
  authors: [];
  description: string;
  imageLinks: BookThumbnails;
  infoLink: string;
  language: string;
  previewLink: string;
  title: string;
}
interface Book {
  title: string;
  description: string;
  authors: [];
  categories: [];
  thumbnail: string;
}

function getBooks(bookTitle: string) {
  const { from } = rxjs;
  const { switchMap, map, tap } = rxjs.operators; // tap per mostrare dati che ci stanno arrivando
  const apiUrl = "https://www.googleapis.com/books/v1/volumes?q=";
  /* chiamata fetch all'api di google */
  const p = fetch(apiUrl + bookTitle).then((res) => res.json()); // promise con api fetch
  // per verificare se il then funziona
  // .then((books) => console.log(books))
  //);
  from(p)
    .pipe(
      tap((data: GoogleBooks) => showTotal(data.items)),
      switchMap((data: GoogleBooks) => from(data.items || [])), // trasformare gli items in una string ritornando gli elementi uno ad uno ||o array vuoto per non avere l'errore in caso non ci siano risultati per l'input di ricerca
      map((ele: BookItem) => {
        // filtrare alcuni elementi crendo un oggetto dall'interface Book
        const book: Book = {
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
    .subscribe((book: Book) => displayBook(book));
}
function showTotal(total: number) {
  const found = document.querySelector("#found");
  if (found) {
    found.textContent = "" + total;
  }
}
function displayBook(book: Book) {
  // mostrre a display
  const bookTpl = /*<div class="col"> commentato per fare append child */ `
    <div class="card shadow-sm">
        <img src="${book.thumbnail}" title="${book.title}" alt="${book.title}">
      <div class="card-body">
        <h3 class="card-text">
          ${book.title}
        </h3>
        <div
          class="d-flex justify-content-between align-items-center"
        >
          <div class="btn-group">
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
            >
              View
            </button>
            <button
              type="button"
              class="btn btn-sm btn-outline-secondary"
            >
              Edit
            </button>
          </div>
          <small class="text-muted">9 mins</small>
        </div>
      </div>
    </div>
  </div>`;
  const div = document.createElement("div");
  div.setAttribute("class", "col");
  div.innerHTML = bookTpl;
  const books = document.querySelector("#books");
  if (books) {
    books.appendChild(div);
  }
}
function cleanBooks() {
  alert("clean");
  const books = document.querySelector("#books");
  if (books) {
    books.innerHTML == "";
  }
}
function searchBooks() {
  const searchEle = document.querySelector("#search");
  // funz che scatena la chiamata creando un observable
  const { fromEvent } = rxjs;
  const { filter, map, switchMap, debounceTime, tap } = rxjs.operators;
  if (searchEle) {
    fromEvent(searchEle, "keyup")
      .pipe(
        map((ele: any) => ele.target.value),
        filter((ele: string) => ele.length > 3), //per drezionare questa stinga a getBooks
        debounceTime(1000), // tempo di attesa prima del risultato del subscribe
        tap(() => cleanBooks()), // funz che pulisce Dom non modifica la string
        switchMap((ele: string) => getBooks(ele)) //ridezionare questa stringa all'altro observable getbooks
      )
      .subscribe((book: Book) => displayBook(book));
  }
}
searchBooks();
