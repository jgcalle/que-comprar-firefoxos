/**
 * Código para interaccionar con la BD indexedDB
 * @jgcalle
 * Adaptado de: http://blog.teamtreehouse.com/create-your-own-to-do-app-with-html5-and-indexeddb
 */
// Gestión del almacen de objetos: comprar [contenido de listas de compras]
// Comienzo del módulo comprarDB con una serie de métodos
var comprarDB = (function() {
  var cDB = {};
  var datastore = null;
  var listaAbierta = 0;


  cDB.open = function(listaAbrir, callback) {

    var version = 7;

    var request = indexedDB.open('comprar', version);

    request.onupgradeneeded = function(e) {
      var db = e.target.result;

      e.target.transaction.onerror = cDB.onerror;

      if (db.objectStoreNames.contains('comprar')) {
        db.deleteObjectStore('comprar');
      }

      var store = db.createObjectStore('comprar', {
        keyPath: 'timestamp'
      });
      store.createIndex("indexLista", "indexLista", { unique: false });
      
    };

    request.onsuccess = function(e) {
      datastore = e.target.result;
      listaAbierta = listaAbrir;
      callback();
    };

    request.onerror = cDB.onerror;
  };


  /**
   * buscarCompras
   * Crea el array compras con la lista de todos los elementos a comprar
   */
  cDB.buscarCompras = function(listaBuscando,callback) {
    var db = datastore;
    var transaction = db.transaction(['comprar'], 'readwrite');
    var objStore = transaction.objectStore('comprar');

    //var keyRange = IDBKeyRange.lowerBound(0);
    var keyRange = IDBKeyRange.only(parseInt(listaBuscando));
          
    //var cursorRequest = objStore.openCursor(keyRange);
    var cursorRequest = objStore.index('indexLista').openCursor(keyRange);

    var compras = [];

    transaction.oncomplete = function(e) {
      callback(compras);
    };

    cursorRequest.onsuccess = function(e) {
      var result = e.target.result;
      if (!!result === false) {
        return;
      }

      compras.push(result.value);

      result.continue();
    };

    cursorRequest.onerror = cDB.onerror;
  };


  /**
   * anadirCompra
   * A�ade o Edita un elemento (recibido como par�metro) a la lista de la compra.
   */
  cDB.anadirCompra = function(nuevoArticulo, callback) {

    var db = datastore;

    var transaction = db.transaction(['comprar'], 'readwrite');

    var objStore = transaction.objectStore('comprar');

    //var timestamp = new Date().getTime();
    
    var anadir = {
      'indexLista': nuevoArticulo.indexLista,
      'aComprar': nuevoArticulo.aComprar,
      'uds': nuevoArticulo.uds,
      'timestamp': nuevoArticulo.timestamp,
      'booComprado': nuevoArticulo.booComprado
    };

    var request = objStore.put(anadir);

    request.onsuccess = function(e) {
      callback(anadir);
    };

    request.onerror = cDB.onerror;
  };

  /**
   * borrarCompra
   * Borra un elemento de la lista de la lista de la compra a partir de su id.
   */
  cDB.borrarCompra = function(id, callback) {
    var db = datastore;
    var transaction = db.transaction(['comprar'], 'readwrite');
    var objStore = transaction.objectStore('comprar');
    
    var request = objStore.delete(id);
    
    request.onsuccess = function(e) {
      callback();
    };
    
    request.onerror = function(e) {
      console.log(e);
    };
  };


  /**
   * buscarCompras
   * Crea el array compras con la lista de todos los elementos a comprar
   */
  cDB.borrarVariasCompras = function(listaBuscando,callback) {
    var db = datastore;
    var transaction = db.transaction(['comprar'], 'readwrite');
    var objStore = transaction.objectStore('comprar');

    var keyRange = IDBKeyRange.only(parseInt(listaBuscando));         
    var cursorRequest = objStore.index('indexLista').openCursor(keyRange);

    transaction.oncomplete = function(e) {
      callback();
    };


    cursorRequest.onsuccess = function(e) {
      var result = e.target.result;
      if (!!result === false) {
        return;
      }
      objStore.delete(result.primaryKey);
      result.continue();
    };

    cursorRequest.onerror = cDB.onerror;
  };

  return cDB;
}());
