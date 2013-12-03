/**
 * Código con la lógica de la aplicación de compras.
 * @jgcalle
 * Adaptado de: http://blog.teamtreehouse.com/create-your-own-to-do-app-with-html5-and-indexeddb
 */
var comprarDB, listaCargar, nuevaLista, nuevoArticulo;
var TIEMPO_TEXTO = 3;       // Segundos que se mostrarán las notificaciones popup
var booBtnBorrar = true;    // El botón borrar elemento no estará disponible si el dispositivo es movil
 
// Clase Lista para instaciar nuevas listas
function Lista(fechacuando, donde, observaciones) {
  this.fechacreacion = getFecha("0");
  this.index = new Date().getTime();
  this.fechacuando = fechacuando;
  this.donde = donde;
  this.observaciones = observaciones;
}

// Clase Lista para instaciar nuevo artículo
function Articulo(id, nombre, unidades, booComprado) {
  this.indexLista = parseInt(listaCargar);
  this.aComprar = nombre;
  this.uds = parseInt(unidades);
  this.timestamp = (id === "0") ? new Date().getTime() : parseInt(id);
  this.booComprado = (booComprado === "true") ? true : false; 
}

window.onload = function() {

    if(window["indexedDB"] !== undefined) {
        
        booBtnBorrar = $$.environment().isMobile ? true : false;
  
        Lungo.dom('#btn-nuevo-articulo').on("singleTap", meterArticuloEnLista);

        Lungo.dom('#btn-nueva-lista').on("singleTap", function(event) {
            if (grabarNuevaLista() === true){
                
                listasDB.open(function(){
                    listasDB.anadirCompra(nuevaLista);
                });
                
                listaCargar = nuevaLista.index;
                
                Lungo.Notification.success(
                    "Lista de la compra creada",                            
                    "Ahora toca añadir los artículo a la lista creada",     
                    "check",    
                    TIEMPO_TEXTO,          
                    Lungo.Router.section('#main-lista') 
                );            
            }
        });

        Lungo.dom('#btn-cancelar-lista').on("singleTap", function(event) {
            Lungo.Notification.confirm({
              icon: 'cancel',
              title: 'Cancelar Lista',
              description: '¿Desea cancelar la nueva lista de la compra?',
              accept: {
                  icon: 'checkmark',
                  label: 'Sí',
                  callback: function(){ 
                      Lungo.Router.section('#main');              
                  }
              },
              cancel: {
                  icon: 'close',
                  label: 'No',
                  callback: function(){ }
              }
            }); 
        });

        Lungo.dom('#main-nueva-lista').on('load', function(){           
            $$("#txtdondeir").val('');
            $$("#txtcuandoir").val('');
            $$("#txtnotas").val('');
        });

        Lungo.dom('#main').on('load', function(){           
            mostrarListasDisponibles();
        });

        Lungo.dom('#main-lista').on('load', function(){
            completarComboUds(1,99);
            comprarDB.open(listaCargar, actualizarCompras); 
            mostrarDatosListaActiva();           
        });

        
        // Al cargar el documento mostrar las listas disponibles por primera vez
        mostrarListasDisponibles();
        
    } else {
        alert("Tu navegador no soporta indexedDB, has probado a actualizarlo?");
    }
    
};

function completarComboUds(from,to){
    for(i=from; i<=to; i++) {
        var opcion = document.createElement('option');
        opcion.setAttribute("value", i);
        opcion.innerHTML = i;
        $$("#comboUds").append(opcion);        
    } 
}

function getFecha(fecha){
    var today = (fecha === "0") ? new Date() : new Date(fecha);
    var dd = today.getDate();
    var mm = today.getMonth()+1; //January is 0!

    var yyyy = today.getFullYear();
    if(dd<10){
        dd='0'+dd;
    }
    if(mm<10){
        mm='0'+mm;
    }
    today = dd+'/'+mm+'/'+yyyy;
    return today;
}

function entornoMobile(){
    var env = $$.environment();
    var texto;

    texto  = "Navegador....." + env.browser;         //[STRING] Browser of your mobile device
    texto += "/r/nEs movil......" + env.isMobile;    //[BOOLEAN]
    texto += "/r/nS.O..........." + env.os.name;     //[STRING] iOS, Android, Blackberry...
    texto += "/r/nversion......." + env.os.version;  //[STRING] Versión of OS
    alert(texto);
}

function grabarNuevaLista(){
    var dondeir_lista = $$("#txtdondeir").val();
    var cuandoir_lista = $$("#txtcuandoir").val();
    var notas_lista = $$("#txtnotas").val();
    var txterror = "Por favor complete:<br/>";
    var boocorrecto = true;
    
    // Donde ir es obligatorio
    if (dondeir_lista === ""){
        txterror += "Donde ir?<br/>";
        boocorrecto = false;        
    }
    
    // Cuando ir es obligatorio  
    if (cuandoir_lista === ""){
        txterror += "Cuando?<br/>";
        boocorrecto = false;        
    }
    
    if(boocorrecto === false){
        Lungo.Notification.error(
            'Necesito algunos datos',   
            txterror,                   
            'info',                     
            TIEMPO_TEXTO                           
        );
    } else  {
        nuevaLista = new Lista(cuandoir_lista, dondeir_lista, notas_lista);
    }
    return boocorrecto;
}

// Añade la información de la lista
// En la cabecera de la sección Articulos de la lista
function mostrarDatosListaActiva(){

    listasDB.open(function(){
        listasDB.buscarCompras(listaCargar,function(lista) {    
            $$("#infoLista").empty();
            var fechaLista = (lista[0].fechacuando === "") ? "" : " - " + getFecha(lista[0].fechacuando);
            var notasLista = (lista[0].txtobservaciones === "") ? "" : "<br />" + lista[0].txtobservaciones;
            $$("#infoLista").append("<strong>" + lista[0].txtdonde + fechaLista + "</strong>" + notasLista);
        });
    });

}


// Obtener el listado de listas de la compra disponibles
function mostrarListasDisponibles(){

    listasDB.open(function(){
        listasDB.buscarCompras("0",function(lista) {  
            $$("#listadoDeListas").empty();                
            if (lista.length !== 0) {            
                $$("#listadoDeListas").append("<h1>Selecciona una lista</h1>");
                $$("#listadoDeListas").append("<ul id='lista-listas'></ul>");
                
                for(var i = 0; i < lista.length; i++) {
                    var listaActual = lista[(lista.length - 1 - i)];        
                    var fechaLista = (listaActual.fechacuando === "") ? "" : getFecha(listaActual.fechacuando);
                    
                    var li = document.createElement('li');
                    li.setAttribute("id", listaActual.timestamp);
                    li.setAttribute("data-id", listaActual.timestamp);
                    li.setAttribute("class", "arrow");
                    $$("#lista-listas").append(li);

                    if (!booBtnBorrar) { // Si el dispositivo no es movil se muestra el botón borrar item
                        var btnBorrar = document.createElement('button');
                        btnBorrar.setAttribute("class", "small");
                        btnBorrar.setAttribute("data-id", listaActual.timestamp);
                        btnBorrar.setAttribute("data-icon", "remove");
                        $$(btnBorrar).text('Borrar');
                        $$(li).append(btnBorrar);

                        //Listener del botón de Eliminar al hacer click para eliminar
                        Lungo.dom(btnBorrar).on("singleTap", function(event) { 
                            event.stopPropagation();              // Evitar que se dispare el evento del padre (li) que contiene al btn 
                            eliminarLista(this);
                        });   
                    }     

                    var strong = document.createElement('strong');
                    strong.innerHTML = listaActual.txtdonde + " - " + fechaLista;
                    $$(li).append(strong);
                  
                }

                Lungo.dom('#lista-listas li').on("singleTap", function(event) {
                    listaCargar = $$(this).attr('data-id');
                    Lungo.Router.section('#main-lista');
                });              
                
                Lungo.dom('#lista-listas li').on("hold", function(event) {
                    eliminarLista(this);
                });     
                
            }            
        });
    });

}

function meterArticuloEnLista(){

    var aComprar = $$('#input-nuevo-articulo').val();
    if (aComprar.replace(/ /g,'') !== '') {
      nuevoArticulo = new Articulo("0",aComprar,$$("#comboUds").val(),"false");
      comprarDB.anadirCompra(nuevoArticulo, function(compra) {
        actualizarCompras();
      });
    }
    $$('#input-nuevo-articulo').val('');
    // $$('#comboUds option:first-child').attr("selected", "true");
    selectTags = document.getElementsByTagName("select");
    selectTags[0].selectedIndex = 0;

}

function eliminarLista(elemento){

    var id = parseInt($$(elemento).attr('data-id')); 
    var articulo = (elemento.tagName === "LI") ? $$(elemento).find('strong').text() : $$(elemento).siblings('strong').text();    
    
    Lungo.Notification.confirm({
      icon: 'remove',
      title: articulo,
      description: '¿Desea borrar esta lista de la compra?',
      accept: {
          icon: 'checkmark',
          label: 'Borrar',             
          callback: function(){ 
              listasDB.open(function(){
                listasDB.borrarCompra(id, function() {
                  comprarDB.open(id,function(){
                    comprarDB.borrarVariasCompras(id, mostrarListasDisponibles);
                  });                    
                });
              });            
          }              
      },
      cancel: {
          icon: 'close',
          label: 'Cancelar',
          callback: function(){ }
      }
    });
 
}

function eliminarArticuloEnLista(elemento){

    var id = parseInt($$(elemento).attr('data-id')); 
    var articulo = (elemento.tagName === "LI") ? $$(elemento).find('strong').text() : $$(elemento).siblings('strong').text();

    Lungo.Notification.confirm({
      icon: 'remove',
      title: 'Borrar ' + articulo,
      description: '¿Desea borrar este artículo de la lista de la compra?',
      accept: {
          icon: 'checkmark',
          label: 'Borrar',
          callback: function(){ 
              comprarDB.borrarCompra(id, actualizarCompras);              
          }
      },
      cancel: {
          icon: 'close',
          label: 'Cancelar',
          callback: function(){ }
      }
    });
 
}

function actualizarCompras() {  

  comprarDB.buscarCompras(listaCargar,function(compras) {
            $$("#lista-compra").empty();                   
            for(var i = 0; i < compras.length; i++) {
                var compraActual = compras[(compras.length - 1 - i)];        

                var li = document.createElement('li');
                li.setAttribute("id", compraActual.timestamp);
                li.setAttribute("data-id", compraActual.timestamp);
                li.setAttribute("data-hecho", compraActual.booComprado); 
                li.setAttribute("data-uds", compraActual.uds); 
                var styleLi = (!compraActual.booComprado) ? "light" : "dark";
                li.setAttribute("class", styleLi);
                $$("#lista-compra").append(li);        

                if (!booBtnBorrar) { // Si el dispositivo no es movil se muestra el botón borrar item
                    var btnBorrar = document.createElement('button');
                    btnBorrar.setAttribute("class", "small");
                    btnBorrar.setAttribute("data-id", compraActual.timestamp);
                    btnBorrar.setAttribute("data-icon", "remove");
                    $$(btnBorrar).text('Borrar');
                    $$(li).append(btnBorrar);

                    //Listener del botón de Eliminar al hacer click para eliminar
                    Lungo.dom(btnBorrar).on("singleTap", function(event) { 
                        event.stopPropagation();              // Evitar que se dispare el evento del padre (li) que contiene al btn 
                        eliminarArticuloEnLista(this);
                    });   
                }     
                
                // Mostrar Unidades
                var btnUds = document.createElement('button');
                btnUds.setAttribute("class", "small disabled");
                txtUnidades = (compraActual.uds !== 0) ? compraActual.uds : "¿?";
                txtTexto = txtUnidades + ((compraActual.uds === 1) ? " Ud." : " Uds");
                $$(btnUds).text(txtTexto);
                $$(li).append(btnUds);                                      
                
                // Mostrar artículo
                var strong = document.createElement('strong');
                strong.innerHTML = compraActual.aComprar;
                strong.style.textDecoration = (!compraActual.booComprado) ? "none" : "line-through";
                $$(li).append(strong);             
            }

            
            /*
            Eventos para seleccionar item
            */
            //Listener del item li al hacer click para seleccionar
            Lungo.dom('#lista-compra li').on("singleTap", function(event) {
                var id = $$(this).attr('data-id'); 
                var articulo = $$(this).find('strong').text();
                var booComprado = $$(this).attr('data-hecho') === "true" ? "false" : "true";
                var uds = $$(this).attr('data-uds');
                nuevoArticulo = new Articulo(id,articulo,uds,booComprado);
                comprarDB.anadirCompra(nuevoArticulo,actualizarCompras);
            });              

            /*
            Eventos para eliminar item
            */
            //Listener del item li de mantener pulsado con el dedo para eliminar
            Lungo.dom('#lista-compra li').on("hold", function(event) {
                eliminarArticuloEnLista(this);
            });     
                           
        });
}