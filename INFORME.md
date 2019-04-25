# **TODO**
Características de la workbench (y cambiar Limitaciones) 8GB de RAM, i3 7ma gen 7100U 2.4 GHz 1 core



# Informe - TP1 (Arquitectura de Software, 75.73)


## Introducción
En este trabajo se comparan algunas tecnologías mediante el uso de varias herramientas de monitoreo, de forma de experimentar con métricas de atributos de calidad.

Como tecnologías bajo carga se tienen por un lado Gunicorn/Flask (Python) y por el otro Express/Node (JavaScript), en cada cual codeamos el mismo servicio HTTP con 3 endpoints (uno de ping, otro de timeout, y otro de cómputo más intenso). Ante estos servidores se utiliza Nginx como load balancer y se levanta cada contenedor mediante docker-compose.

Para generar la carga usamos Artillery y para el monitoreo y visualización de métricas aprovechamos el stack sugerido de cAdvisor + StatsD + Graphite + Grafana.


## Casos de prueba
Los distintos casos que corremos son:

* `node`: 1 servidor Express/Node
* `gunicorn`: 1 servidor Gunicorn/Python con un worker
* `gunicorn_replicated`: multiples servidores de Gunicorn
* `gunicorn_multiworker`: adicionamos el caso de 1 servidor Gunicorn con múltiples workers*

\*Cada *worker* puede ocuparse de resolver 1 request de forma casi independiente, dejando a otros libres para nuevos requests.


## Escenarios
En los casos pesados testeamos simplemente con un perfil plano de requests constantes. Para el caso particular de healthcheck, al tener poco costo computacional y de memoria, creamos un escenario más complejo para ver cómo reaccionan los servicios a los cambios. El escenario a simular para dicho caso es el siguiente:

1. Plano con baja-mediana cantidad de requests
1. Pico de requests, aumentando 5 veces su valor inicial
1. Plano de alta cantidad de requests
1. Plano de baja cantidad de requests
1. Pico de requests, aumentando 10 veces su valor


## Limitaciones
No se tuvo tiempo para correr estas pruebas en distintas máquinas (separando el testbench de las herramientas de carga y monitoreo), lo cual es poco pragmático para casos reales ya que se introduce mucho ruido en los resultados observados. Tampoco nos preocupamos por definir y documentar claramente el testbench (como el hardware) en el que se corren los servicios ya que no es el propósito de este trabajo la medición objetiva de los servidores sino realizar comparaciones a grandes rasgos y experimentar con las herramientas propuestas.


## Resultados esperados
A nivel general se espera que el servidor de Node supere ampliamente a todos los casos de Python, por estar mucho más orientado a estos usos. Cuando se maneja gran numero de requests que requieran mucho tiempo o mucho procesamiento se espera que los resultados muestren grandes diferencias.


## Endpoints y resultados obtenidos

### Health
Este endpoint representa un *ping* sin contenido, un chequeo de vida que devuelve inmediatamente sin ningún cómputo ni acceso a persistencia. Es el request más simple posible que alcance al comportamiento del servidor.

**Resultados esperados:**
Como se trata de una consulta simple se espera que los resultados entre los distintos servidores no varien demasiado pero podrian exitir una pequeñas variacion en el servidor de python segun la cantidad de request porque como solo contiene un worker y debe resolverlo de manera secuencial puede que se genere un cuello de botella en alguno de los picos

**Resultados obtenidos:**

| Node |
| ---- | ---- |
| <p style="text-align: center;">![alt text][health-node-graph]</p> |
| <p style="text-align: center;">![alt text][health-node-summary]</p> |

| Gunicorn |
| ---- | ---- |
| <p style="text-align: center;">![alt text][health-gunicorn-graph]</p> |
| <p style="text-align: center;">![alt text][health-gunicorn-summary]</p> |

| Gunicorn replicado |
| ---- | ---- |
| <p style="text-align: center;">![alt text][health-gunicorn-rep-graph]</p> |
| <p style="text-align: center;">![alt text][health-gunicorn-rep-summary]</p> |

| Gunicorn multiworker |
| ---- | ---- |
| <p style="text-align: center;">![alt text][health-gunicorn-mw-graph]</p> |
| <p style="text-align: center;">![alt text][health-gunicorn-mw-summary]</p> |

Para el caso de healthcheck no hay sorpresas: ninguna de las configuraciones (Node, Gunicorn, Gunicorn multiworker) tiene problemas con la carga leve y todos los requests obtienen respuesta. Esto es esperable al ser tan liviano el endpoint, aunque seguramente empezaríamos a ver problemas si el tráfico creciera de forma insostenible.

Como mediana de latencia se tienen algunos milisegundos en todos los casos y nunca un request tarda siquiera 100 ms. También vemos que en todos los casos el uso de CPU no es significativo.


### Proxy/timeout
Este endpoint implica la espera de un tiempo determinado antes de responder. Implica mínimo costo computacional para el servidor pero todavía teniendo un tiempo de respuesta no inmediato, con lo que sería como un *ping* con *delay*. Puede representar que el valor buscado se tiene que buscar en otro servicio (que en este ejemplo siempre tardaría lo mismo en responder) antes de devolverlo, pero sin implicar mucho uso de recursos para el servidor en sí.

**Resultados esperados:**
En este caso esperamos que se note una diferencia entre el servidor de Python, el de Node y el de Python replicado. En el de Python simple deberia generarse un cuello de botella que se acentuaria notariamente en los picos de requests generados, lo cual en las múltiples intancias de Python se vería mas atenuado pero aun asi esperando algunos atrasos en las respuestas. Por su lado, para el de Node esperamos...............................

**Resultados obtenidos:**

| Node |
| ---- | ---- |
| <p style="text-align: center;">![alt text][proxy-node-graph]</p> |
| <p style="text-align: center;">![alt text][proxy-node-summary]</p> |

| Gunicorn |
| ---- | ---- |
| <p style="text-align: center;">![alt text][proxy-gunicorn-graph]</p> |
| <p style="text-align: center;">![alt text][proxy-gunicorn-summary]</p> |

| Gunicorn replicado |
| ---- | ---- |
| <p style="text-align: center;">![alt text][proxy-gunicorn-rep-graph]</p> |
| <p style="text-align: center;">![alt text][proxy-gunicorn-rep-summary]</p> |

| Gunicorn multiworker |
| ---- | ---- |
| <p style="text-align: center;">![alt text][proxy-gunicorn-mw-graph]</p> |
| <p style="text-align: center;">![alt text][proxy-gunicorn-mw-summary]</p> |

Para este endpoint solo hemos utilizado un escenario plano con una significativa cantidad de requests. Lo que buscamos es ver cómo cada servicio es afectado por recibir esta carga donde cada pedido ocupa un thread.

A partir de los resultados podemos constatar que el servidor de Node tiene la capacidad de responder a la gran cantidad de requests enviados. Vemos en nuestras pruebas que logra contestar cada request con código de exito 200.

Por otro lado tenemos que todas las configuraciones de los servidores con Gunicorn solo puedieron responder una porción de los pedidos (200), y para el resto se obtuvo *timeout* (504).

Esto se debe a la forma en la que trabaja Gunicorn por defecto, con un único worker de manera secuencial. Los requests van llegando y deben esperar a que el resto termine, con lo que se genera un cuello de botella que desencadena en una gran cantidad de timeouts. Esto se comprueba ya que la configuración más simple de estas (Gunicorn) solo responde una pequeña cantidad de los pedidos, pero cuando aumentamos la cantidad de servidores (Gunicorn replicado) o la cantidad de workers (Gunicorn multiworker) se logra una mayor capacidad de respuesta.

De igual manera esto no causa un gran uso



### Intensive
Este endpoint resuelve ciertas operaciones matemáticas antes de devolver, de forma que por dicho tiempo esté realizando muchos cómputos (con uso intenso de poca memoria) y por lo tanto más "CPU". Como implementación de esto en cada request se calculan (de forma poco optimizada) todos los números primos hasta cierto número bastante alto (se experimenta con un valor final en el orden de los millones ya que eso produce tiempos de respuesta similares al timeout cuando se solicitan de forma aislada).

**Resultados esperados:**
Aca se espera una diferencia importante entre el servidor de Node y el de Python en base a quién pueda resolver los mismos cálculos en menor tiempo pero todavía se tendrá como factor muy importante el número de requests que cada servidor pueda soportar de forma simultánea. Es por esto que se puede esperar que el servicio basado en varios servidores de Python (`gunicorn_replicated`) salga mejor parado que los demás (la diferencia sería muy significativa si estos además se corrieran de forma distribuida).

**Resultados obtenidos:**

| Node |
| ---- | ---- |
| <p style="text-align: center;">![alt text][intensive-node-graph]</p> |
| <p style="text-align: center;">![alt text][intensive-node-summary]</p> |

| Gunicorn |
| ---- | ---- |
| <p style="text-align: center;">![alt text][intensive-gunicorn-graph]</p> |
| <p style="text-align: center;">![alt text][intensive-gunicorn-summary] |

| Gunicorn replicado |
| ---- | ---- |
| <p style="text-align: center;">![alt text][intensive-gunicorn-rep-graph]</p> |
| <p style="text-align: center;">![alt text][intensive-gunicorn-rep-summary]</p> |

| Gunicorn multiworker |
| ---- | ---- |
| <p style="text-align: center;">![alt text][intensive-gunicorn-mw-graph]</p> |
| <p style="text-align: center;">![alt text][intensive-gunicorn-mw-summary]</p> |

...................



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
