/**
 * Código para interaccionar con la BD indexedDB
 * @jgcalle
 * Adaptado de: http://blog.teamtreehouse.com/create-your-own-to-do-app-with-html5-and-indexeddb
 */
// Gestión del almacen de objetos: listas [conjunto de listas de la compra]
// Comienzo del módulo listasDB con una serie de métodos
var listasDB = (function() {
  var cDB = {};
  var datastore = null;

  cDB.open = function(callback) {

    var version = 4;

    var request = indexedDB.open('listas_comprar', version);

    request.onupgradeneeded = function(e) {
      var db = e.target.result;

      e.target.transaction.onerror = cDB.onerror;

      if (db.objectStoreNames.contains('listas_comprar')) {
        db.deleteObjectStore('listas_comprar');
      }

      var store = db.createObjectStore('listas_comprar', {
        keyPath: 'timestamp'
      });
      
    };

    request.onsuccess = function(e) {
      datastore = e.target.result;
      callback();
    };

    request.onerror = cDB.onerror;
  };


  /**
   * buscarCompras
   * Crea el array compras con la lista de todas las listas
   */
  cDB.buscarCompras = function(filtro, callback) {
    var db = datastore;
    var transaction = db.transaction(['listas_comprar'], 'readwrite');
    var objStore = transaction.objectStore('listas_comprar');

    var keyRange = (filtro === "0") ? IDBKeyRange.lowerBound(0) : IDBKeyRange.only(parseInt(filtro));
          
    var cursorRequest = objStore.openCursor(keyRange);
    
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
   * A�ade un elemento (recibido como par�metro) a la lista de listas
   */
  cDB.anadirCompra = function(nuevaLista) {

    var db = datastore;

    var transaction = db.transaction(['listas_comprar'], 'readwrite');

    var objStore = transaction.objectStore('listas_comprar');
   
    var anadir = {
      'timestamp': nuevaLista.index,
      'fechacreacion': nuevaLista.fechacreacion,
      'fechacuando': nuevaLista.fechacuando,
      'txtdonde': nuevaLista.donde,
      'txtobservaciones': nuevaLista.observaciones
    };

    var request = objStore.put(anadir);


    request.onsuccess = function(e) {

    };

    request.onerror = cDB.onerror;
  };


  /**
   * borrarCompra
   * Borra un elemento de la lista de la lista de la compra a partir de su id.
   */
  cDB.borrarCompra = function(id, callback) {
    var db = datastore;
    var transaction = db.transaction(['listas_comprar'], 'readwrite');
    var objStore = transaction.objectStore('listas_comprar');
    
    var request = objStore.delete(id);
    
    request.onsuccess = function(e) {
      callback();
    };
    
    request.onerror = function(e) {
      console.log(e);
    };
  };

  return cDB;
}());
