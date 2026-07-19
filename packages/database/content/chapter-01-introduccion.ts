import type { ChapterContent } from "./types.js";

/**
 * Capítulo 1 de Tanenbaum & Wetherall, 5th Ed. — "Introducción". Fuentes:
 * Computer Networks 5th Ed. §1.1–§1.5, complementado con datos vigentes de
 * adopción de IPv6 (Google IPv6 Statistics), Wi-Fi 6/6E/7 (IEEE 802.11ax/be)
 * y RFCs de IETF donde corresponde — citados inline en el texto, no
 * inventados. No confundir el "nivel de jugador" (XP acumulado) con estos
 * `Level` de currículo: `levelRequired` referencia al primero.
 */
export const CHAPTER_01_INTRODUCCION: ChapterContent = {
  tanenbaumChapter: 1,
  courseSlug: "redes-de-computadoras-i",
  levelRequired: 0,
  levels: [
    // -----------------------------------------------------------------
    // Nivel 1
    // -----------------------------------------------------------------
    {
      order: 1,
      title: "Usos y Aplicaciones de las Redes",
      description:
        "Por qué existen las redes de computadoras: qué problema resuelven para empresas, hogares, usuarios móviles y la sociedad en general.",
      xpReward: 50,
      sections: [
        {
          heading: "¿Qué es una red de computadoras?",
          body:
            "Una **red de computadoras** es un conjunto de dispositivos autónomos interconectados por una tecnología " +
            "capaz de intercambiar información. \"Autónomos\" es la palabra clave: cada nodo puede iniciar, detener o " +
            "modificar sus propias operaciones, y ningún dispositivo tiene control absoluto sobre otro para forzarlo a " +
            "arrancar, parar o supervisar su ejecución — eso es lo que distingue una red de un sistema multiprocesador " +
            "fuertemente acoplado (Tanenbaum, §1.1).\n\n" +
            "Durante décadas, la industria distinguió entre redes de computadoras y redes de telecomunicaciones " +
            "(telefonía). Esa distinción prácticamente desapareció: la voz hoy viaja como paquetes IP (VoIP), la " +
            "televisión se distribuye por streaming sobre IP, y las redes móviles 4G/5G son, en su núcleo, redes de " +
            "conmutación de paquetes. Todo converge hacia una única infraestructura: **Internet Protocol (IP)** como " +
            "denominador común.",
        },
        {
          heading: "Aplicaciones empresariales: compartir recursos y trabajar en conjunto",
          body:
            "La motivación original para conectar computadoras en una empresa fue el **compartimiento de recursos**: " +
            "que todos los programas, equipos (impresoras, storage) y datos estén disponibles para cualquiera en la " +
            "red, sin importar la ubicación física del recurso o del usuario. Un servidor de archivos centralizado, " +
            "por ejemplo, evita que cada empleado necesite su propia copia de cada documento.\n\n" +
            "Un segundo objetivo, igual de importante, es proveer **alta disponibilidad**: al tener múltiples fuentes " +
            "de suministro (por ejemplo, varios servidores replicados), si uno falla, los otros pueden asumir su " +
            "carga, aunque sea con una degradación de performance. Esto es central en la computación en la nube " +
            "moderna — servicios como AWS, Azure o Google Cloud replican datos entre múltiples zonas de " +
            "disponibilidad exactamente por esta razón.\n\n" +
            "Un tercer motivo es el **ahorro de dinero**: computadoras pequeñas tienen una relación precio/rendimiento " +
            "mucho mejor que las grandes. El modelo cliente-servidor explota justamente esto: en vez de una " +
            "mainframe gigante, una empresa despliega muchas computadoras económicas (clientes) que consultan a " +
            "servidores especializados por datos o cómputo bajo demanda.\n\n" +
            "Finalmente, las redes son un poderoso **medio de comunicación** entre empleados: correo electrónico, " +
            "videoconferencia, mensajería instantánea y colaboración en documentos en tiempo real (Google Docs, " +
            "Microsoft 365) permiten que equipos distribuidos geográficamente trabajen como si estuvieran en la " +
            "misma oficina — la base técnica del trabajo remoto e híbrido.",
        },
        {
          heading: "Aplicaciones domésticas, móviles y el Internet de las Cosas (IoT)",
          body:
            "En el hogar, las redes dan acceso a información remota (noticias, streaming de video bajo demanda tipo " +
            "Netflix, redes sociales), comunicación persona a persona, entretenimiento interactivo (gaming online, " +
            "realidad virtual multijugador) y **comercio electrónico**.\n\n" +
            "Los **usuarios móviles** representan uno de los segmentos de mayor crecimiento: smartphones, tablets y " +
            "laptops se conectan tanto a redes celulares (4G LTE, 5G) como a redes Wi-Fi, y esperan continuidad de " +
            "servicio al moverse entre ambas (un fenómeno llamado *handoff* o *roaming*). El **Internet de las Cosas " +
            "(IoT)** extiende esto a dispositivos no tradicionales — termostatos, cámaras de seguridad, sensores " +
            "industriales, wearables — que se comunican de forma autónoma, muchas veces con protocolos livianos " +
            "diseñados para bajo consumo de energía (como MQTT o CoAP), un tema que retomamos en profundidad en el " +
            "Capítulo 4 (subcapa MAC) al hablar de redes de sensores inalámbricos.",
        },
        {
          heading: "Aspectos sociales: privacidad, seguridad y libertad de expresión",
          body:
            "Tanenbaum dedica una sección completa a las **implicancias sociales** de las redes, y sigue siendo " +
            "sorprendentemente vigente: cuanto más conectada está la sociedad, mayor es la tensión entre la " +
            "conveniencia de compartir información y el derecho a la privacidad. Redes sociales, sistemas de " +
            "recomendación y publicidad dirigida dependen de recolectar y correlacionar datos de comportamiento a " +
            "una escala que era impensable hace 20 años.\n\n" +
            "Esto tiene consecuencias técnicas directas para este curso: el diseño de protocolos modernos (HTTPS por " +
            "defecto, TLS 1.3, cifrado de extremo a extremo en mensajería) responde en gran parte a esta presión " +
            "social por privacidad — lo vas a ver en detalle en el Capítulo 8 (Seguridad en Redes). También surgen " +
            "temas como la **neutralidad de red** (¿puede un proveedor de Internet priorizar cierto tráfico sobre " +
            "otro?) y la moderación de contenido a escala global, que dependen tanto de decisiones de política " +
            "pública como de la arquitectura técnica subyacente.",
        },
      ],
      realWorldApplication:
        "Cuando te conectás a Google Docs desde tu casa mientras un compañero edita el mismo documento desde la " +
        "oficina, estás viendo los cuatro motivos de Tanenbaum en acción al mismo tiempo: compartimiento de recursos " +
        "(el documento vive en un servidor de Google, no en tu disco), alta disponibilidad (si un datacenter de " +
        "Google falla, otro toma el control sin que lo notes), el modelo cliente-servidor abaratando el hardware que " +
        "necesitás (tu laptop no necesita procesar el documento, solo renderizarlo) y comunicación en tiempo real " +
        "entre personas. Empresas como Slack, Zoom y Notion son, en esencia, aplicaciones construidas enteramente " +
        "sobre estas cuatro motivaciones originales de conectar computadoras.",
      miniQuiz: [
        {
          id: "l1-q1",
          question: "¿Cuál de las siguientes NO es una motivación clásica (Tanenbaum) para construir una red empresarial?",
          options: [
            "Compartimiento de recursos (archivos, impresoras, cómputo)",
            "Alta disponibilidad mediante fuentes de suministro replicadas",
            "Reemplazar completamente la necesidad de ciberseguridad",
            "Ahorro de dinero vía el modelo cliente-servidor",
          ],
          correctIndex: 2,
          explanation:
            "Las redes no reemplazan la necesidad de seguridad — al contrario, la introducen como un problema nuevo (más superficie de ataque). Las otras tres son motivaciones explícitas del capítulo.",
        },
        {
          id: "l1-q2",
          question: "¿Qué caracteriza a los nodos de una red de computadoras, según la definición de Tanenbaum?",
          options: [
            "Deben ser todos del mismo fabricante y sistema operativo",
            "Son autónomos: ningún dispositivo puede forzar a otro a iniciar, detener o controlar su ejecución",
            "Siempre requieren una computadora central que los administre",
            "Solo pueden comunicarse si están en la misma red local",
          ],
          correctIndex: 1,
          explanation:
            "La autonomía es la clave de la definición: distingue una red de un sistema multiprocesador fuertemente acoplado, donde sí existe control centralizado.",
        },
        {
          id: "l1-q3",
          question: "El Internet de las Cosas (IoT) suele usar protocolos como MQTT o CoAP en lugar de HTTP tradicional principalmente porque:",
          options: [
            "HTTP no puede transportarse sobre IP",
            "Los dispositivos IoT necesitan protocolos livianos, de bajo consumo energético y bajo overhead",
            "MQTT y CoAP son más rápidos que TCP en cualquier escenario",
            "HTTP fue discontinuado por el IETF",
          ],
          correctIndex: 1,
          explanation:
            "Muchos dispositivos IoT corren con baterías pequeñas o hardware muy limitado; protocolos como MQTT/CoAP minimizan el overhead de mensajes y el consumo de energía comparado con HTTP.",
        },
      ],
    },
    // -----------------------------------------------------------------
    // Nivel 2
    // -----------------------------------------------------------------
    {
      order: 2,
      title: "Hardware de Red: Escala y Topologías",
      description:
        "Cómo se clasifican las redes según su alcance geográfico y tecnología de transmisión — de PAN a Internet, de Wi-Fi 6 a la fibra óptica submarina.",
      xpReward: 50,
      sections: [
        {
          heading: "Tecnologías de transmisión: broadcast vs. punto a punto",
          body:
            "Tanenbaum clasifica las redes según su **tecnología de transmisión** en dos grandes categorías:\n\n" +
            "- **Enlaces de broadcast (difusión)**: un único canal de comunicación es compartido por todas las " +
            "máquinas de la red. Los paquetes enviados por cualquier nodo son recibidos por todos los demás; un " +
            "campo de dirección indica para quién es el paquete, y el resto simplemente lo ignora. Wi-Fi clásico y " +
            "Ethernet clásico (con hub) son ejemplos. Suelen permitir **direccionamiento a múltiples destinos**: " +
            "*multicast* (un subconjunto de máquinas) o *broadcast* (todas las máquinas).\n" +
            "- **Enlaces punto a punto (unicast)**: conectan pares individuales de máquinas. Para ir de origen a " +
            "destino, un paquete puede tener que atravesar varias máquinas intermedias (*routers*), posiblemente por " +
            "múltiples rutas de distinta longitud — el problema de **enrutamiento**, que es el corazón del " +
            "Capítulo 5.\n\n" +
            "Como regla general (con excepciones, como los satélites): las redes pequeñas y geográficamente " +
            "concentradas tienden a usar broadcast; las redes grandes y dispersas tienden a ser punto a punto.",
        },
        {
          heading: "Clasificación por escala: de PAN a Internet",
          body:
            "La otra dimensión de clasificación es la **distancia física** que cubre la red — la escala determina " +
            "qué tecnologías son viables:\n\n" +
            "| Tipo | Distancia típica | Ejemplo |\n" +
            "|---|---|---|\n" +
            "| **PAN** (Personal Area Network) | ~1–10 m | Bluetooth entre tu teléfono y tus auriculares |\n" +
            "| **LAN** (Local Area Network) | Un edificio/campus | Wi-Fi 6/6E de una oficina, Ethernet de un datacenter |\n" +
            "| **MAN** (Metropolitan Area Network) | Una ciudad | Red de fibra que interconecta sedes de un banco |\n" +
            "| **WAN** (Wide Area Network) | Un país/continente | Backbone de un ISP, red privada corporativa entre países |\n" +
            "| **Internet** | Global | La interconexión de decenas de miles de redes autónomas (AS) |\n\n" +
            "Las **LAN** son redes privadas que operan dentro de un único edificio o campus. Tienen tamaño " +
            "restringido, lo que hace que el peor caso de tiempo de transmisión sea conocido de antemano — una " +
            "propiedad que simplifica el diseño de red. Las LAN cableadas modernas típicamente corren a 1–10 Gbps " +
            "con latencia baja y tasas de error mínimas; las LAN inalámbricas (Wi-Fi) alcanzan hasta 9.6 Gbps " +
            "teóricos con **Wi-Fi 6 (802.11ax)**, y **Wi-Fi 6E**/**Wi-Fi 7 (802.11be, ratificado en 2024)** suman la " +
            "banda de 6 GHz, con velocidades de hasta ~46 Gbps y multi-link operation (MLO) para usar varias bandas " +
            "simultáneamente — contenido que profundizamos en el Capítulo 4.\n\n" +
            "Las **WAN** cubren un área geográfica extensa, a menudo un país o continente, y son operadas típicamente " +
            "por un ISP que conecta múltiples sitios de clientes. Hoy, muchas empresas reemplazan WANs privadas " +
            "tradicionales (MPLS) por **SD-WAN** (Software-Defined WAN), que enruta tráfico de forma inteligente " +
            "sobre múltiples enlaces (fibra, LTE/5G, banda ancha residencial) gestionados centralmente por software.",
        },
        {
          heading: "Internetworking: cómo Internet conecta redes de redes",
          body:
            "**Internet no es una única red**: es una *internetwork* — una colección de redes independientes " +
            "interconectadas mediante **routers**, que forman una red más grande y homogénea desde el punto de vista " +
            "lógico, aunque el hardware subyacente sea heterogéneo (fibra, cobre, radio). Cada red administrativamente " +
            "independiente que compone Internet se llama **Sistema Autónomo (AS)** — por ejemplo, un ISP grande, una " +
            "universidad o un proveedor de nube son cada uno un AS con su propio número (ASN), y se comunican entre " +
            "sí mediante el protocolo **BGP** (Border Gateway Protocol), que vas a estudiar en profundidad en el " +
            "Capítulo 5.\n\n" +
            "Esta arquitectura de \"red de redes\" es la razón por la que Internet escaló de unas pocas universidades " +
            "en 1969 (ARPANET, 4 nodos) a miles de millones de dispositivos hoy: cada AS solo necesita administrar su " +
            "propia infraestructura y acordar reglas de intercambio de tráfico con sus vecinos, sin necesitar una " +
            "autoridad central que controle todo el sistema.",
        },
        {
          heading: "Conmutación de circuitos vs. conmutación de paquetes",
          body:
            "Históricamente existieron dos paradigmas para transportar datos entre dos puntos:\n\n" +
            "- **Conmutación de circuitos** (usada por la telefonía tradicional): se reserva un camino dedicado " +
            "extremo a extremo antes de transmitir, con capacidad garantizada durante toda la llamada, se use o no. " +
            "Simple de razonar, pero desperdicia capacidad en los silencios de la conversación.\n" +
            "- **Conmutación de paquetes** (la base de Internet): los datos se dividen en paquetes que viajan de " +
            "forma independiente, compartiendo el enlace dinámicamente con paquetes de otros usuarios (*statistical " +
            "multiplexing*). Mucho más eficiente para tráfico \"a ráfagas\" (bursty) como la navegación web, pero " +
            "introduce el problema de **congestión**: si demasiados paquetes llegan a un router al mismo tiempo, " +
            "hay que decidir qué hacer con el excedente (encolar, descartar) — el tema central del Capítulo 6.\n\n" +
            "Prácticamente toda la infraestructura de red moderna — Internet, LTE/5G, Wi-Fi — usa conmutación de " +
            "paquetes. La \"conmutación de circuitos\" sobrevive como una capa lógica virtual sobre paquetes (por " +
            "ejemplo, MPLS puede emular circuitos), no como tecnología física real en la mayoría de los casos.",
        },
      ],
      realWorldApplication:
        "La próxima vez que tu router doméstico muestre \"Wi-Fi 6\" en su caja, ya sabés que estás usando 802.11ax: " +
        "una LAN inalámbrica de broadcast que comparte el mismo canal de radio entre todos tus dispositivos, con " +
        "OFDMA para servir a varios dispositivos en paralelo dentro de un mismo símbolo de tiempo. Ese router después " +
        "actúa como el punto de entrada a una WAN (la red de tu ISP), que a su vez se conecta — vía BGP — con miles " +
        "de otros Sistemas Autónomos para formar Internet. Cada video de YouTube que ves viajó como una secuencia de " +
        "paquetes conmutados de forma independiente, probablemente por rutas distintas, y se reensambló en tu " +
        "dispositivo — nunca hubo un \"circuito dedicado\" entre vos y el datacenter de Google.",
      miniQuiz: [
        {
          id: "l2-q1",
          question: "Una red que cubre un único edificio de oficinas, con un límite conocido de tiempo de transmisión en el peor caso, se clasifica como:",
          options: ["PAN", "LAN", "MAN", "WAN"],
          correctIndex: 1,
          explanation: "Una LAN (Local Area Network) es privada, de tamaño restringido, y típicamente cubre un edificio o campus — justo la propiedad que permite acotar el peor caso de latencia.",
        },
        {
          id: "l2-q2",
          question: "¿Qué es un Sistema Autónomo (AS) en el contexto de Internet?",
          options: [
            "Un único router de borde",
            "Una red administrada independientemente (ej. un ISP o universidad) que se conecta a otras vía BGP",
            "Un protocolo de cifrado usado en VPNs",
            "El nombre técnico de una LAN doméstica",
          ],
          correctIndex: 1,
          explanation: "Internet es una internetwork de Sistemas Autónomos; cada uno tiene su propio ASN y decide sus propias políticas de enrutamiento internas, intercambiando rutas con vecinos vía BGP.",
        },
        {
          id: "l2-q3",
          question: "La conmutación de paquetes es más eficiente que la de circuitos para tráfico web principalmente porque:",
          options: [
            "Los paquetes nunca se pierden, a diferencia de los circuitos",
            "Permite compartir dinámicamente la capacidad del enlace entre múltiples flujos de tráfico a ráfagas",
            "Elimina por completo la necesidad de enrutamiento",
            "Los circuitos son incompatibles con la fibra óptica",
          ],
          correctIndex: 1,
          explanation: "El tráfico web es \"bursty\" (ráfagas seguidas de silencio); reservar un circuito dedicado desperdiciaría capacidad en los silencios, mientras que la conmutación de paquetes multiplexa estadísticamente el enlace entre usuarios.",
        },
      ],
    },
    // -----------------------------------------------------------------
    // Nivel 3
    // -----------------------------------------------------------------
    {
      order: 3,
      title: "Software de Red: Jerarquías de Protocolos y Modelos de Referencia",
      description:
        "El corazón conceptual de todo el curso: por qué las redes se diseñan en capas, y cómo se comparan los modelos OSI y TCP/IP.",
      xpReward: 50,
      sections: [
        {
          heading: "Por qué las redes se organizan en capas",
          body:
            "Para reducir la complejidad de su diseño, prácticamente todas las redes se organizan como una **pila de " +
            "capas** (*layers*), cada una construida sobre la anterior. El número de capas, sus nombres, contenidos y " +
            "funciones difieren de red en red — pero el propósito de cada capa es siempre ofrecer ciertos " +
            "**servicios** a las capas superiores, ocultándoles los detalles de cómo esos servicios se implementan " +
            "realmente.\n\n" +
            "Cuando la capa *n* de una máquina se comunica con la capa *n* de otra máquina, las reglas y convenciones " +
            "usadas en esa conversación se llaman colectivamente el **protocolo de la capa *n***. Un protocolo es un " +
            "acuerdo entre las partes que se comunican sobre cómo debe proceder la comunicación — como el protocolo " +
            "diplomático entre embajadores de dos países.\n\n" +
            "Es importante distinguir: ninguna capa envía datos directamente a la capa *n* de la otra máquina. En " +
            "cambio, cada capa pasa datos e información de control a la capa inmediatamente inferior, hasta llegar a " +
            "la **capa física**, donde ocurre la comunicación real (mediante señales eléctricas, luz u ondas de " +
            "radio). Esto es *comunicación virtual* entre pares (los rectángulos con líneas punteadas horizontales " +
            "en los diagramas clásicos) versus *comunicación física* real (las líneas sólidas verticales).",
        },
        {
          heading: "Interfaces, servicios y el principio de independencia de capas",
          body:
            "Entre cada par de capas adyacentes hay una **interfaz**, que define qué operaciones y servicios " +
            "primitivos ofrece la capa inferior a la superior. Una interfaz bien definida y minimalista simplifica " +
            "enormemente reemplazar la implementación de una capa por otra completamente distinta (por ejemplo, " +
            "cambiar de Wi-Fi a Ethernet cableado), siempre y cuando la nueva implementación ofrezca exactamente el " +
            "mismo conjunto de servicios a la capa superior — esto se llama **independencia de capas** y es una de " +
            "las ideas más poderosas del diseño de redes.\n\n" +
            "El conjunto de capas y protocolos se llama **arquitectura de red**. Una lista de los protocolos usados " +
            "por un sistema particular, uno por capa, se llama **pila de protocolos** (*protocol stack*). Esta es " +
            "exactamente la razón por la que tu navegador (capa de aplicación, HTTP) no necesita saber si estás " +
            "conectado por Wi-Fi, Ethernet o datos móviles: esa decisión ocurre en capas inferiores, totalmente " +
            "invisibles para HTTP.",
        },
        {
          heading: "Servicios orientados a conexión vs. sin conexión",
          body:
            "Las capas pueden ofrecer a las capas superiores dos tipos de servicio:\n\n" +
            "- **Orientado a conexión**: el servicio primero establece una conexión, la usa, y luego la libera — como " +
            "una llamada telefónica. Los datos suelen entregarse en el mismo orden en que se enviaron. TCP es el " +
            "ejemplo canónico: hace un *handshake* de 3 vías antes de transmitir (Capítulo 6).\n" +
            "- **Sin conexión (connectionless)**: cada paquete lleva la dirección completa de destino y se enruta de " +
            "forma independiente de los demás — como enviar cartas por correo postal. No hay garantía de orden ni de " +
            "entrega. UDP es el ejemplo canónico, usado en DNS, videollamadas y streaming en vivo, donde la latencia " +
            "importa más que la confiabilidad perfecta.\n\n" +
            "Cada servicio se caracteriza además por su **fiabilidad**: un servicio confiable nunca pierde datos, " +
            "típicamente vía acuses de recibo (ACKs) del receptor — con el costo de overhead y latencia adicional. " +
            "Para aplicaciones sensibles al tiempo real (voz, video en vivo), ese overhead puede ser peor que " +
            "ocasionalmente perder o corromper un poco de datos: por eso VoIP usa RTP sobre UDP, no TCP.",
        },
        {
          heading: "El Modelo de Referencia OSI",
          body:
            "El modelo **OSI** (Open Systems Interconnection, ISO 1983) define 7 capas, pensadas antes de que " +
            "existieran los protocolos que las implementarían — un diseño *ex ante*:\n\n" +
            "1. **Física**: transmisión de bits crudos sobre un medio (voltajes, frecuencias, temporización).\n" +
            "2. **Enlace de Datos**: transforma un medio de transmisión crudo en una línea libre de errores de " +
            "transmisión no detectados para la capa de red (framing, control de errores).\n" +
            "3. **Red**: controla la operación de la subred — enrutamiento de paquetes desde el origen hasta el " +
            "destino, incluso a través de múltiples redes distintas.\n" +
            "4. **Transporte**: acepta datos de la capa de sesión, los divide en unidades más pequeñas si hace " +
            "falta, y garantiza que lleguen correctamente al otro extremo — la primera capa verdaderamente " +
            "*extremo a extremo*.\n" +
            "5. **Sesión**: permite a usuarios de distintas máquinas establecer *sesiones* entre ellos (control de " +
            "diálogo, sincronización).\n" +
            "6. **Presentación**: se ocupa de la sintaxis y semántica de la información transmitida (codificación de " +
            "datos, compresión, cifrado a nivel de datos).\n" +
            "7. **Aplicación**: contiene los protocolos que usan directamente las aplicaciones de usuario.\n\n" +
            "En la práctica, **el modelo OSI en sí (las 7 capas) sobrevivió, pero sus protocolos originales nunca " +
            "tuvieron éxito comercial** y quedaron obsoletos. Hoy usamos el vocabulario OSI (\"switch de Capa 2\", " +
            "\"firewall de Capa 3/4\", \"balanceador de Capa 7\") todo el tiempo en la industria, aunque el tráfico " +
            "real corra sobre TCP/IP.",
        },
        {
          heading: "El Modelo de Referencia TCP/IP y su comparación con OSI",
          body:
            "El modelo **TCP/IP**, en cambio, nació al revés: primero existieron los protocolos (desarrollados para " +
            "ARPANET), y el modelo de 4 capas se describió *después*, como una generalización de lo que ya " +
            "funcionaba:\n\n" +
            "1. **Enlace** (Link): equivalente aproximado a Física + Enlace de Datos de OSI.\n" +
            "2. **Internet**: define el datagrama IP y el enrutamiento — equivalente a la capa de Red de OSI. Este " +
            "es el \"cuello de botella\" deliberado de la arquitectura: cualquier red física de abajo y cualquier " +
            "aplicación de arriba pueden usar IP como pegamento común (el diseño en forma de \"reloj de arena\").\n" +
            "3. **Transporte**: TCP y UDP, equivalente a la capa de Transporte de OSI.\n" +
            "4. **Aplicación**: combina las funciones de Sesión, Presentación y Aplicación de OSI en una sola capa " +
            "— TCP/IP nunca necesitó esa separación porque las aplicaciones reales (HTTP, SMTP, DNS) manejan esas " +
            "funciones directamente cuando las necesitan.\n\n" +
            "**Comparación clave**: OSI separó claramente los conceptos de *servicio*, *interfaz* y *protocolo* — " +
            "una decisión de diseño excelente que TCP/IP no tuvo originalmente, y una de las razones por las que OSI " +
            "sigue siendo la mejor herramienta *pedagógica* para razonar sobre redes, aunque TCP/IP haya sido el " +
            "*ganador comercial*. Ambos modelos siguen coexistiendo en la enseñanza: usamos las 7 capas de OSI para " +
            "explicar conceptos y las 4 capas de TCP/IP para describir la implementación real de Internet — que es " +
            "exactamente el enfoque de este curso.",
        },
      ],
      realWorldApplication:
        "Cuando un ingeniero de redes dice \"el problema está en la Capa 3\", está usando terminología OSI para " +
        "señalar que la falla es de enrutamiento IP — aunque ningún paquete real en Internet lleve una cabecera OSI. " +
        "Herramientas como Wireshark muestran capturas de tráfico organizadas visualmente según el modelo OSI (Frame " +
        "= Capa 2, IP = Capa 3, TCP/UDP = Capa 4, HTTP/DNS = Capa 7) precisamente porque ese vocabulario compartido " +
        "facilita diagnosticar problemas en equipos multidisciplinarios: un especialista en cableado piensa en Capa " +
        "1, un administrador de firewall en Capa 3/4, y un desarrollador de APIs en Capa 7 — todos hablando de la " +
        "misma pila TCP/IP real, pero describiéndola con el vocabulario de 7 capas de OSI.",
      miniQuiz: [
        {
          id: "l3-q1",
          question: "¿Qué es, con precisión, un \"protocolo\" en el contexto de una arquitectura de red en capas?",
          options: [
            "El cable físico que conecta dos máquinas",
            "El conjunto de reglas y convenciones que rigen la conversación entre entidades pares de la misma capa en máquinas distintas",
            "Un sinónimo de \"interfaz entre capas adyacentes\"",
            "El nombre comercial de una tarjeta de red",
          ],
          correctIndex: 1,
          explanation: "El protocolo gobierna la comunicación virtual entre entidades pares (capa n con capa n de la otra máquina); la interfaz, en cambio, define los servicios entre capas adyacentes de la misma máquina.",
        },
        {
          id: "l3-q2",
          question: "¿Cuántas capas tiene el modelo OSI, y cuántas el modelo TCP/IP tal como se enseña habitualmente?",
          options: ["OSI: 5, TCP/IP: 7", "OSI: 7, TCP/IP: 4", "OSI: 4, TCP/IP: 7", "Ambos tienen 7 capas"],
          correctIndex: 1,
          explanation: "OSI define 7 capas (Física, Enlace, Red, Transporte, Sesión, Presentación, Aplicación); TCP/IP se describe habitualmente con 4 (Enlace, Internet, Transporte, Aplicación), fusionando Sesión/Presentación/Aplicación en una sola.",
        },
        {
          id: "l3-q3",
          question: "Un servicio orientado a conexión (como TCP) se diferencia de uno sin conexión (como UDP) principalmente en que:",
          options: [
            "TCP nunca puede usarse para video, solo UDP",
            "TCP establece la conexión antes de transmitir y suele garantizar orden/entrega; UDP envía cada paquete de forma independiente, sin garantías",
            "UDP siempre es más lento que TCP",
            "No hay ninguna diferencia real entre ambos",
          ],
          correctIndex: 1,
          explanation: "TCP hace handshake y gestiona orden/retransmisión (como una llamada telefónica); UDP envía datagramas independientes sin esas garantías (como cartas postales) — por eso UDP es preferido cuando la latencia importa más que la fiabilidad perfecta.",
        },
      ],
    },
  ],
  bossBattle: {
    title: "Boss Battle: Fundamentos de Redes",
    description:
      "El examen integrador del Capítulo 1. Cubre usos de redes, hardware/escala, y software/modelos de referencia. " +
      "Necesitás 70% para aprobar y desbloquear el Capítulo 2 (Capa Física).",
    passingScore: 70,
    maxXp: 300,
    questions: [
      {
        id: "boss-q1",
        question: "Una empresa reemplaza una mainframe única por decenas de PCs económicas que consultan servidores especializados. ¿Qué motivación de Tanenbaum ilustra mejor esta decisión?",
        options: [
          "Aspectos sociales",
          "Ahorro de dinero vía el modelo cliente-servidor (mejor relación precio/rendimiento)",
          "Alta disponibilidad",
          "Estandarización de protocolos",
        ],
        correctIndex: 1,
        explanation: "Las computadoras pequeñas tienen mejor relación precio/rendimiento; el modelo cliente-servidor permite explotar esa ventaja sin sacrificar acceso a recursos especializados centralizados.",
      },
      {
        id: "boss-q2",
        question: "¿Qué distingue formalmente a una red de computadoras de un sistema multiprocesador fuertemente acoplado?",
        options: [
          "La velocidad de transmisión",
          "La autonomía de los nodos: en una red, ningún dispositivo puede forzar el control de otro",
          "El uso obligatorio de fibra óptica",
          "El número de capas del modelo OSI que implementa",
        ],
        correctIndex: 1,
        explanation: "La autonomía de los nodos es la definición central de \"red\" en Tanenbaum §1.1.",
      },
      {
        id: "boss-q3",
        question: "Un enlace donde un único canal es compartido por todas las máquinas, y cada paquete lleva una dirección de destino que las demás máquinas ignoran, es un enlace de tipo:",
        options: ["Punto a punto", "Broadcast (difusión)", "Circuito dedicado", "Half-duplex exclusivamente"],
        correctIndex: 1,
        explanation: "Es la definición exacta de un enlace de broadcast — Wi-Fi y Ethernet clásico (con hub) son ejemplos históricos.",
      },
      {
        id: "boss-q4",
        question: "Ordená de menor a mayor escala geográfica: LAN, PAN, WAN, MAN.",
        options: [
          "PAN < LAN < MAN < WAN",
          "LAN < PAN < WAN < MAN",
          "WAN < MAN < LAN < PAN",
          "PAN < MAN < LAN < WAN",
        ],
        correctIndex: 0,
        explanation: "PAN (metros) < LAN (un edificio) < MAN (una ciudad) < WAN (un país o continente).",
      },
      {
        id: "boss-q5",
        question: "¿Por qué Internet se describe como una \"internetwork\" y no como \"una red\"?",
        options: [
          "Porque usa exclusivamente satélites",
          "Porque es una colección de Sistemas Autónomos independientes interconectados mediante routers, sin una autoridad central única",
          "Porque solo funciona dentro de un país a la vez",
          "Porque no usa el protocolo IP",
        ],
        correctIndex: 1,
        explanation: "Internet conecta miles de redes administrativamente independientes (AS) que acuerdan intercambiar tráfico vía BGP — eso es literalmente una \"red de redes\".",
      },
      {
        id: "boss-q6",
        question: "¿Por qué la conmutación de paquetes es más adecuada que la de circuitos para el tráfico típico de navegación web?",
        options: [
          "Porque el tráfico web es constante y predecible",
          "Porque el tráfico web es a ráfagas (bursty), y la conmutación de paquetes multiplexa estadísticamente la capacidad entre usuarios",
          "Porque los circuitos no pueden viajar por fibra óptica",
          "No hay diferencia real de eficiencia entre ambas",
        ],
        correctIndex: 1,
        explanation: "Reservar un circuito dedicado desperdiciaría capacidad durante los \"silencios\" del tráfico bursty; la conmutación de paquetes comparte el enlace dinámicamente.",
      },
      {
        id: "boss-q7",
        question: "En una arquitectura de red en capas, ¿qué es una \"interfaz\" (a diferencia de un \"protocolo\")?",
        options: [
          "El conjunto de reglas entre entidades pares de la misma capa en máquinas distintas",
          "El conjunto de operaciones y servicios que una capa ofrece a la capa inmediatamente superior, en la misma máquina",
          "Un sinónimo exacto de protocolo",
          "El cable de red físico",
        ],
        correctIndex: 1,
        explanation: "La interfaz es local, entre capas adyacentes de la misma máquina; el protocolo es la conversación virtual entre capas iguales de máquinas distintas.",
      },
      {
        id: "boss-q8",
        question: "El modelo OSI define 7 capas. ¿Cuáles son, en orden, desde la más baja hasta la más alta?",
        options: [
          "Física, Enlace, Red, Transporte, Sesión, Presentación, Aplicación",
          "Enlace, Física, Red, Sesión, Transporte, Aplicación, Presentación",
          "Aplicación, Presentación, Sesión, Transporte, Red, Enlace, Física (esto también sería correcto de arriba a abajo, pero la pregunta pide de abajo a arriba)",
          "Física, Red, Enlace, Presentación, Sesión, Transporte, Aplicación",
        ],
        correctIndex: 0,
        explanation: "El orden canónico de abajo hacia arriba es: Física (1), Enlace de Datos (2), Red (3), Transporte (4), Sesión (5), Presentación (6), Aplicación (7).",
      },
      {
        id: "boss-q9",
        question: "¿Cuál de estas afirmaciones sobre OSI vs. TCP/IP es correcta?",
        options: [
          "Los protocolos originales de OSI dominan Internet hoy, y TCP/IP es solo un modelo teórico",
          "El modelo OSI (las 7 capas como marco conceptual) sigue siendo útil pedagógicamente, pero sus protocolos originales no tuvieron éxito comercial; TCP/IP ganó como implementación real",
          "TCP/IP y OSI son exactamente el mismo modelo con nombres distintos",
          "OSI nunca definió una capa de Transporte",
        ],
        correctIndex: 1,
        explanation: "Distinción clave del capítulo: el modelo OSI (marco de 7 capas) sobrevivió como herramienta conceptual; sus protocolos específicos fracasaron comercialmente frente a TCP/IP.",
      },
      {
        id: "boss-q10",
        question: "Un servicio de streaming de video en vivo usa UDP en lugar de TCP para el video principalmente porque:",
        options: [
          "UDP es más seguro que TCP",
          "Para tráfico en tiempo real, la latencia baja importa más que garantizar la entrega perfecta de cada paquete",
          "TCP no puede transportar video bajo ninguna circunstancia",
          "UDP siempre usa menos ancho de banda que TCP",
        ],
        correctIndex: 1,
        explanation: "TCP prioriza fiabilidad (retransmisiones, orden) a costa de latencia; para video/voz en tiempo real, un paquete perdido es preferible a esperar su retransmisión, así que UDP (vía RTP) es la elección típica.",
      },
    ],
  },
};
