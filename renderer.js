const fs = require('fs');
const quill = require('quill');

let book;

class helper {
  static ready(fn) {
    if (document.attachEvent ? document.readyState === "complete" : document.readyState !== "loading"){
      fn();
    } else {
      document.addEventListener('DOMContentLoaded', fn);
    }
  }
}

class Meta {
  constructor(meta) {
    this.title = meta.title;
    this.author = meta.author;
  }
}

class Chapter {
  constructor(chapter) {
    this.title = chapter.title;
    this.content = chapter.content;
  }
}

class Book {
	constructor(book) {
    this.metadata = new Meta(book.metadata);
    let temp_chapter = [];

    book.chapter_list.forEach(function (e) {
      temp_chapter.push(new Chapter(e));
    });

    this.chapter_list = temp_chapter;
    this.current_chapter = 0;
	}

  save_to_file() {
    let data = Buffer.from(JSON.stringify(this));
    fs.writeFile('/users/jneumann/Desktop/book.nw', data, (err) => {
      if (err) throw err;
    });
  }
}

helper.ready(() => {
  let editor = new quill('#editor', {
    modules: {
      toolbar: [
        ['bold', 'italic', 'underline', 'strike'],        // toggled buttons
        ['blockquote', 'code-block'],

        [{ 'list': 'ordered'}, { 'list': 'bullet' }],
        ['link', 'image'],

        [{ 'size': ['small', false, 'large', 'huge'] }],  // custom dropdown
        [{ 'align': [] }],

        ['clean'],
      ],
    },
    theme: 'snow',
  });

  let chapter_table = document.querySelector('.chapters');
  fs.readFile('/users/jneumann/Desktop/book.nw', 'utf8', (err, data) => {
    if (err) {
      throw err;
    }

    let data_parsed = JSON.parse(data);

    book = new Book(data_parsed);

    document.querySelector('.chapters').innerHTML = '';

    book.chapter_list.forEach(function (e, i) {
      let tr = document.createElement('tr');
      tr.onclick = function () {
        document.querySelector('.active').classList = '';
        this.className = 'active';
        book.current_chapter = i;
        editor.setContents(book.chapter_list[book.current_chapter].content);
      };
      tr.innerHTML = "<td>" + e.title + "</td>";
      chapter_table.appendChild(tr);
    });

    chapter_table.firstChild.classList = 'active';

    editor.setContents(book.chapter_list[0].content);
  });

  editor.on('editor-change', function(delta, oldDelta, source) {
    book.chapter_list[book.current_chapter].content = editor.getContents();
    book.save_to_file();
  });
});
