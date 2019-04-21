Se presentan tres casos
* servidor node
* servidor python con un worker 
* multiples servidores de python


escenario para todos los casos
* Plano con baja cantidad de request
* Pico de request, aumentando 5 veces su valor inicial
* Plano de alta cantidad de request
* Plano de baja cantidad de request
* Pico de request aumentando 10 veces su valor

Resultados esperados
A nivel general se espera que el servidor de node supere ampliamente a todos los de python. Cuando se maneja gran numero de request que requieran mucho tiempo o mucho procesamiento se espera que los resultados muestren grandes diferencias. 

## Endpoint planteados

### Health
Este endpoint representa un ping sin contenido(descripcion del compartamiento del endpoint)
* Resultados esperados
  * Como se trata de una consulta simple se espera que los resultados entre los distintos servidores no varien demasiado pero podrian exitir una pequeñas variacion en el servidor de python segun la cantidad de request porque como solo contiene un worker y debe resolverlo de manera secuencial puede que se genere un cuello de botella en alguno de los picos
* Valores obtenidos

graficos

* Analisis de los valores

### Ping
  Espera un tiempo determinao y responde (descripcion del compartamiento del endpoint)

* Resultados esperados
  * En este caso esperamos que se note una diferencia entre el servidor de python, el de node y el python replicado. En el de python simple deberia generarse un cuello de botella que se asentuaria notariamente en los picos de request generados, en las multiples intancias de python esto se veria mas atenuado pero en los momentos de picos aun asi podrian generarse algunos atrasos en las respuestas en el de node explica alan porque no entiendo como chorizo funciona
* Valores obtenidos

graficos

* Analisis de los valores
  
### Intensive
  Calcula todos los numeros de primos de un numero alto (descripcion del compartamiento del endpoint)

* Resultados esperados
  * Aca se espera una gran diferencia entre el servidor de node y el de python ya que los calculos los hace mucho mas rapido pero, debido que en ambos casos es un procesamiento costoso, el numero de requests sopartadas sera bastante bajo, por lo cual los servidores de python replicados podran soportar 
  
* Valores obtenidos

graficos

* Analisis de los valores
  