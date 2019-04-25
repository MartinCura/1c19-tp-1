# Informe - TP1 (Arquitectura de Software, 75.73)

  - [Introducción](#introducci%C3%B3n)
  - [Casos de prueba](#casos-de-prueba)
  - [Escenarios](#escenarios)
  - [Limitaciones](#limitaciones)
  - [Workbench](#workbench)
  - [Resultados esperados](#resultados-esperados)
  - [Endpoints y resultados obtenidos](#endpoints-y-resultados-obtenidos)
    - [Health](#health)
    - [Proxy/timeout](#proxytimeout)
    - [Intensive](#intensive)


## Introducción
En este trabajo se comparan algunas tecnologías mediante el uso de varias herramientas de monitoreo, de forma de experimentar con métricas de atributos de calidad.

Como tecnologías bajo carga se tienen por un lado Gunicorn/Flask (Python) y por el otro Express/Node (JavaScript), en cada cual codeamos el mismo servicio HTTP con 3 endpoints (uno de ping, otro de timeout, y otro de cómputo más intenso). Ante estos servidores se utiliza Nginx como load balancer y se levanta cada contenedor mediante docker-compose.

Para generar la carga usamos Artillery y para el monitoreo y visualización de métricas aprovechamos el stack sugerido de cAdvisor + StatsD + Graphite + Grafana.


## Casos de prueba
Los distintos casos que corremos son:

* `node`: 1 servidor Express/Node
* `gunicorn`: 1 servidor Gunicorn/Python con un worker
* `gunicorn_replicated`: múltiples servidores de Gunicorn
* `gunicorn_multiworker`: adicionamos el caso de 1 servidor Gunicorn con múltiples workers*

\*Cada *worker* puede ocuparse de resolver 1 request de forma casi independiente, dejando a otros libres para nuevos requests.


## Escenarios
En los casos pesados testeamos simplemente con un perfil plano de requests constantes. Para el caso particular de healthcheck, al tener mínimo costo computacional y de memoria, creamos un escenario más complejo para ver cómo reaccionan los servicios a los cambios. El escenario a simular para dicho caso es el siguiente:

1. Plano con baja-mediana cantidad de requests
2. Pico de requests, aumentando 5 veces su valor inicial
3. Plano de alta cantidad de requests
4. Plano de baja cantidad de requests
5. Pico de requests, aumentando 10 veces su valor


## Workbench
Para este trabajo se utilizó una laptop con procesador Intel i3 7100U (7ma gen) 2.4 GHZ Dual Core, con 8 GB de RAM y disco SSD.


## Limitaciones
No se tuvo tiempo para correr estas pruebas en distintas máquinas (separando el testbench de las herramientas de carga y monitoreo), lo cual es poco pragmático para casos reales ya que se introduce mucho ruido en los resultados observados. También hubiera sido interesante correr estas partes de forma remota, para incluir el efecto de la red en las pruebas.


## Resultados esperados
A nivel general se espera que el servidor de Node supere ampliamente a todos los casos de Python, por estar mucho más orientado a estos usos. Cuando se maneja gran numero de requests que requieran mucho tiempo o mucho procesamiento se espera que los resultados muestren grandes diferencias.


## Endpoints y resultados obtenidos

### Health
Este endpoint representa un *ping* sin contenido, un chequeo de vida que devuelve inmediatamente sin ningún cómputo ni acceso a persistencia. Es el request más simple posible que alcance al comportamiento del servidor.

#### Resultados esperados
Como se trata de una consulta simple se espera que los resultados entre los distintos servidores no varíen demasiado pero podrían exitir una pequeñas variación en el servidor de Python según la cantidad de request porque como solo contiene un worker y debe resolverlo de manera secuencial puede que se genere un cuello de botella en alguno de los picos.

#### Resultados obtenidos
Para el caso de healthcheck no hay sorpresas: ninguna de las configuraciones (`node`, `gunicorn`, `gunicorn_replicated`, `gunicorn_multiworker`) tiene problemas con la carga leve y todos los requests obtienen respuesta. Esto es esperable al ser tan liviano el endpoint, aunque seguramente empezaríamos a ver problemas si el tráfico creciera de forma insostenible.

Como mediana de latencia en todos los casos se obtienen valores de algunos milisegundos, y nunca un request tarda siquiera 100 ms. También podemos ver que en la mayoría de los casos el máximo se produce al comienzo de la conexión, lo que era esperable. Además, confirmamos que el uso de CPU no fue significativo.

| Node |
|:----:|
| ![alt text][health-node-graph] |
| ![alt text][health-node-summary] |

| Gunicorn |
|:----:|
| ![alt text][health-gunicorn-graph] |
| ![alt text][health-gunicorn-summary] |

| Gunicorn replicado |
|:----:|
| ![alt text][health-gunicorn-rep-graph] |
| ![alt text][health-gunicorn-rep-summary] |

| Gunicorn multiworker |
|:----:|
| ![alt text][health-gunicorn-mw-graph] |
| ![alt text][health-gunicorn-mw-summary] |


### Proxy/timeout
Este endpoint implica la espera de un tiempo determinado antes de responder. Esto genera un mínimo costo computacional para el servidor teniendo un tiempo de respuesta no inmediato, comportándose entonces "como un *ping* con *delay*". Podría representar una subconsulta a otro servicio para responder la original, sin implicar mucho uso de recursos para el servidor en sí (para este ejemplo, la subconsulta simulada siempre tardaría lo mismo).

#### Resultados esperados
En este caso esperamos notar una diferencia entre los servidores de Python (simple, replicado y multiworker) y el servidor de Node. Por la forma secuencial de trabajo debería generarse un cuello de botella en el servidor de Python, el cual se acentuaría notoriamente si exitiesen picos de requests generados. Este comportamiento se debería manterer tanto en el replicado como en el multiworker cuando la cantidad de requests es tan grande que incluso repartiéndose la carga en los workers o en las réplicas no sea capas de procesarlas. De esta manera, si bien en el cuello de botella se vea atenuado por ser capaz de atender más consultas en paralelo, todos los servidores Gunicorn terminarían colapsados ante un número significativo de requests. Por otro lado, el servidor Node, gracias a su implementación, no debería tener este problema (o debería ser mucho mejor para atenuarlo). Se espera que este pueda responder todas las consultas sin grandes problemas y en tiempos similares.

#### Resultados obtenidos
Para este endpoint solo hemos utilizado un escenario plano con una significativa cantidad de requests. Lo que buscamos es ver cómo cada servicio es afectado por recibir esta carga donde cada pedido ocupa un thread.

A partir de los resultados podemos constatar que el servidor de Node tiene la capacidad de responder la totalidad de requests enviados. Vemos en nuestras pruebas que logra contestar cada request con código de éxito 200. Además comprobamos que los tiempos de respuesta son extremadamente similares, teniendo la media muy próxima al máximo en el tiempo de respuesta.

Por otro lado tenemos que todas las configuraciones de los servidores con Gunicorn solo pudieron responder una porción de los pedidos (200), y para el resto se obtuvo *timeout* (504).
En el servidor simple solo se llega a responder un 5 % de manera correcta, mientras que en el replicado y multiworker la cantidad aumenta a aproximadamente 17 % y 23 % respectivamente, lo que demuestra que el cuello de botella se atenúa pero no es capaz de evitarse completamente.

Esto se debe a la forma en la que trabaja Gunicorn por defecto, con un único worker atendiendo requests de manera secuencial, es decir, el único thread encargado de resolver un request no atiende otro hasta terminar con lo que el resto debe esperar. Los requests van llegando y quedan esperando a que los anteriores terminen, con lo que se genera un cuello de botella que desencadena en una gran cantidad de *timeouts*. Esto se comprueba al ver que la configuración más simple de estas (`gunicorn`) solo responde una pequeña porción de los pedidos, pero cuando aumentamos la cantidad de servidores (`gunicorn_replicated`) o la cantidad de workers (`gunicorn_multiworker`) se logra una mejor capacidad de respuesta.

| Node |
|:----:|
| ![alt text][proxy-node-graph] |
| ![alt text][proxy-node-summary] |

| Gunicorn |
|:----:|
| ![alt text][proxy-gunicorn-graph] |
| ![alt text][proxy-gunicorn-summary] |

| Gunicorn replicado |
|:----:|
| ![alt text][proxy-gunicorn-rep-graph] |
| ![alt text][proxy-gunicorn-rep-summary] |

| Gunicorn multiworker |
|:----:|
| ![alt text][proxy-gunicorn-mw-graph] |
| ![alt text][proxy-gunicorn-mw-summary] |


### Intensive
Este endpoint resuelve ciertas operaciones matemáticas antes de devolver, de forma que durante este tiempo estará realizando muchos cómputos (con uso intenso de poca memoria) y por lo tanto más del recurso que llamamos "CPU". Como implementación de esto, en cada request se calcula una cierta cantidad de números pertenecientes a la secuencia de Fibonacci (a través de la fórmula exacta). Se experimenta con valores tales que en el workbench se produzcan tiempos de respuesta similares al *timeout* del endpoint anterior cuando se solicitan de forma aislada.

#### Resultados esperados
Acá se espera una diferencia importante entre el servidor de Node y el de Python en base a quién pueda resolver los mismos cálculos en menor tiempo, pero todavía se tendrá como factor muy importante el número de requests que cada servidor pueda soportar de forma simultánea. Es por esto que se puede esperar que el servicio basado en varios servidores de Python (`gunicorn_replicated`) salga mejor parado que los demás (la diferencia sería muy significativa si los servidores de este se corrieran de forma distribuida).

#### Resultados obtenidos
En este caso, a diferencia de los demas, el servidor de Python (`gunicorn`) funcionó mejor que el de Node ya que Python resulta mucho mejor para resolver operaciones matemáticas. Se observa que no hubo un gran uso de CPU por parte del servidor Gunicorn (un poco mas del 1 %) mientras que el servidor Node tuvo un uso del 11 %; si bien esto no es un gran uso de CPU, sí lo es en comparación al de los casos basados en Python.

Asimismo, se observa que también hay una diferencia significativa entre la cantidad de requests finalizados correctamente en el servidor Gunicorn y en el servidor Node, con ventaja del servidor basado en Python. La versión de servidores replicados (`gunicorn_replicated`, siempre con el *load balancer* de Nginx frente) y la multiworker (`gunicorn_multiworker`) tuvieron una gran mejora en la cantidad de requests finalizados correctamente, ya que no había un único hilo de ejecución.

El servidor multiworker tuvo un mayor consumo de CPU, lo cual era lo esperado ya que era un único servidor, pero aun así bastante menor al consumo de recursos por parte del servidor Node. Por último, los servidores de Gunicorn replicados tuvieron menor consumo individual de CPU que el de Gunicorn individual ya que la carga se distribuía entre ellos y cada uno tuvo una menor cantidad de requests que procesar. Los servidores replicados, al no tener tanto procesamiento a diferencia del multiworker, respondieron más rápido, provocando que los requests que recibían no fallaran por *timeout*.

| Node |
|:----:|
| ![alt text][intensive-node-graph] |
| ![alt text][intensive-node-summary] |

| Gunicorn |
|:----:|
| ![alt text][intensive-gunicorn-graph] |
| ![alt text][intensive-gunicorn-summary] |

| Gunicorn replicado |
|:----:|
| ![alt text][intensive-gunicorn-rep-graph] |
| ![alt text][intensive-gunicorn-rep-summary] |

| Gunicorn multiworker |
|:----:|
| ![alt text][intensive-gunicorn-mw-graph] |
| ![alt text][intensive-gunicorn-mw-summary] |



[//]: # (Imágenes)

[health-node-graph]: images/node_health.png "health-node-graph"
[health-node-summary]: images/node_health_summary.png "health-node-summary"
[health-gunicorn-graph]: images/gunicorn_health.png "health-gunicorn-graph"
[health-gunicorn-summary]: images/gunicorn_health_summary.png "health-gunicorn-summary"
[health-gunicorn-rep-graph]: images/gunicorn_replicated_health.png "health-gunicorn-rep-graph"
[health-gunicorn-rep-summary]: images/gunicorn_replicated_health_summary.png "health-gunicorn-rep-summary"
[health-gunicorn-mw-graph]: images/gunicorn_multiworker_health.png "health-gunicorn-mw-graph"
[health-gunicorn-mw-summary]: images/gunicorn_multiworker_health_summary.png "health-gunicorn-mw-summary"

[proxy-node-graph]: images/node_proxy.png "proxy-node-graph"
[proxy-node-summary]: images/node_proxy_summary.png "proxy-node-summary"
[proxy-gunicorn-graph]: images/gunicorn_proxy.png "proxy-gunicorn-graph"
[proxy-gunicorn-summary]: images/gunicorn_proxy_summary.png "proxy-gunicorn-summary"
[proxy-gunicorn-rep-graph]: images/gunicorn_replicated_proxy.png "proxy-gunicorn-rep-graph"
[proxy-gunicorn-rep-summary]: images/gunicorn_replicated_proxy_summary.png "proxy-gunicorn-rep-summary"
[proxy-gunicorn-mw-graph]: images/gunicorn_multiworker_proxy.png "proxy-gunicorn-mw-graph"
[proxy-gunicorn-mw-summary]: images/gunicorn_multiworker_proxy_summary.png "proxy-gunicorn-mw-summary"

[intensive-node-graph]: images/node_intensive.png "intensive-node-graph"
[intensive-node-summary]: images/node_intensive_summary.png "intensive-node-summary"
[intensive-gunicorn-graph]: images/gunicorn_intensive.png "intensive-gunicorn-graph"
[intensive-gunicorn-summary]: images/gunicorn_intensive_summary.png "intensive-gunicorn-summary"
[intensive-gunicorn-rep-graph]: images/gunicorn_replicated_intensive.png "intensive-gunicorn-rep-graph"
[intensive-gunicorn-rep-summary]: images/gunicorn_replicated_intensive_summary.png "intensive-gunicorn-rep-summary"
[intensive-gunicorn-mw-graph]: images/gunicorn_multiworker_intensive.png "intensive-gunicorn-mw-graph"
[intensive-gunicorn-mw-summary]: images/gunicorn_multiworker_intensive_summary.png "intensive-gunicorn-mw-summary"
