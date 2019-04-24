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
* `gunicorn_multiworker`: 1 servidor Gunicorn con múltiples workers*

\*Cada *worker* puede ocuparse de resolver 1 request de forma casi independiente, dejando a otros libres para nuevos requests.


## Escenario común
Para cada caso y endpoint testeados, simulamos el siguiente escenario de requests:

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

**Resultados obtenidos:** [análisis] [gráficos]


### Proxy/timeout
Este endpoint implica la espera de un tiempo determinado antes de responder. Implica mínimo costo computacional para el servidor pero todavía teniendo un tiempo de respuesta no inmediato, con lo que sería como un *ping* con *delay*. Puede representar que el valor buscado se tiene que buscar en otro servicio (que en este ejemplo siempre tardaría lo mismo en responder) antes de devolverlo, pero sin implicar mucho uso de recursos para el servidor en sí.

**Resultados esperados:**
En este caso esperamos que se note una diferencia entre el servidor de Python, el de Node y el de Python replicado. En el de Python simple deberia generarse un cuello de botella que se acentuaria notariamente en los picos de requests generados, lo cual en las múltiples intancias de Python se vería mas atenuado pero aun asi esperando algunos atrasos en las respuestas. Por su lado, para el de Node esperamos...............................

**Resultados obtenidos:** [análisis] [gráficos]


### Intensive
Este endpoint resuelve ciertas operaciones matemáticas antes de devolver, de forma que por dicho tiempo esté realizando muchos cómputos (con uso intenso de poca memoria) y por lo tanto más "CPU". Como implementación de esto en cada request se calculan (de forma poco optimizada) todos los números primos hasta cierto número bastante alto (se experimenta con un valor final en el orden de los millones ya que eso produce tiempos de respuesta similares al timeout cuando se solicitan de forma aislada).

**Resultados esperados:**
Aca se espera una diferencia importante entre el servidor de Node y el de Python en base a quién pueda resolver los mismos cálculos en menor tiempo pero todavía se tendrá como factor muy importante el número de requests que cada servidor pueda soportar de forma simultánea. Es por esto que se puede esperar que el servicio basado en varios servidores de Python (`gunicorn_replicated`) salga mejor parado que los demás (la diferencia sería muy significativa si estos además se corrieran de forma distribuida).

**Resultados obtenidos:** [análisis] [gráficos]
