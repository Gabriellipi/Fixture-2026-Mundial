# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: predictions.spec.js >> PREDICTIONS — score input behaviour >> Blur on empty home input auto-fills "0"
- Location: tests/qa/predictions.spec.js:38:3

# Error details

```
TimeoutError: locator.click: Timeout 10000ms exceeded.
Call log:
  - waiting for locator('nav').last().locator('button').filter({ hasText: /predic/i }).first()

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - banner [ref=e4]:
    - generic [ref=e6]:
      - button "Fixture Digital 2026" [ref=e8] [cursor=pointer]:
        - img "Fixture Digital 2026" [ref=e9]
      - navigation "Primary" [ref=e10]:
        - button "Inicio" [ref=e11] [cursor=pointer]: Inicio
        - button "Sedes" [ref=e13] [cursor=pointer]: Sedes
        - button "Grupos" [ref=e14] [cursor=pointer]: Grupos
        - button "EN VIVO" [ref=e15] [cursor=pointer]: EN VIVO
        - button "Pred." [ref=e16] [cursor=pointer]: Pred.
        - button "Mis picks" [ref=e17] [cursor=pointer]: Mis picks
        - button "Cruces" [ref=e18] [cursor=pointer]: Cruces
      - generic [ref=e19]:
        - button "Buscar selección o país" [ref=e21] [cursor=pointer]:
          - img [ref=e22]
        - button "Elegir idioma" [ref=e26] [cursor=pointer]:
          - img [ref=e27]
        - button "Tu identidad" [ref=e31] [cursor=pointer]:
          - img [ref=e32]
  - main [ref=e35]:
    - generic [ref=e37]:
      - generic [ref=e38]:
        - generic [ref=e39]:
          - img "Fixture Digital 2026" [ref=e41]
          - generic [ref=e42]:
            - paragraph [ref=e43]: Fixture Digital 2026
            - paragraph [ref=e44]: Edición Mundial
        - generic [ref=e45]:
          - heading "Dashboard" [level=2] [ref=e46]
          - paragraph [ref=e47]: Bienvenido de vuelta, QA Test User
      - generic [ref=e48]:
        - generic [ref=e49]:
          - paragraph [ref=e50]: Puntos
          - paragraph [ref=e51]: "0"
          - paragraph [ref=e52]: Aún no inicia
        - generic [ref=e53]:
          - generic [ref=e54]: QT
          - img "Equipo favorito Argentina" [ref=e55]
    - generic [ref=e57]:
      - paragraph [ref=e58]: Faltan para el inicio
      - generic [ref=e59]:
        - generic [ref=e60]:
          - generic [ref=e61]: "51"
          - generic [ref=e62]: Días
        - generic [ref=e63]:
          - generic [ref=e64]: "04"
          - generic [ref=e65]: Horas
        - generic [ref=e66]:
          - generic [ref=e67]: "22"
          - generic [ref=e68]: Min
        - generic [ref=e69]:
          - generic [ref=e70]: "25"
          - generic [ref=e71]: Seg
    - generic [ref=e73]:
      - generic [ref=e77]: Datos oficiales FIFA al 16 Abr 2026
      - generic [ref=e78]:
        - generic [ref=e79]:
          - paragraph [ref=e80]: USA · Mexico · Canada
          - heading "Sigue el Mundial 2026 con partidos, grupos oficiales y tus predicciones." [level=1] [ref=e81]
          - paragraph [ref=e82]: Ahora puedes trabajar con borradores editables y enviar picks finales antes del cierre de cada partido.
          - generic [ref=e83]:
            - generic [ref=e84]:
              - paragraph [ref=e85]: Sedes
              - paragraph [ref=e86]: 16 ciudades anfitrionas
            - generic [ref=e87]:
              - paragraph [ref=e88]: Formato
              - paragraph [ref=e89]: 48 selecciones y 12 grupos
            - generic [ref=e90]:
              - paragraph [ref=e91]: Objetivo
              - paragraph [ref=e92]: Predecir antes del cierre
        - img "Fixture Digital 2026" [ref=e97]
      - generic [ref=e98]:
        - generic [ref=e99]:
          - paragraph [ref=e100]: Partidos
          - paragraph [ref=e101]: "72"
        - generic [ref=e102]:
          - paragraph [ref=e103]: Selecciones
          - paragraph [ref=e104]: "48"
        - generic [ref=e105]:
          - paragraph [ref=e106]: Fechas
          - paragraph [ref=e107]: 11 Jun - 19 Jul 2026
    - generic [ref=e109]:
      - generic [ref=e111]:
        - img "Argentina" [ref=e113]
        - generic [ref=e114]:
          - paragraph [ref=e115]: Tu selección
          - heading "Argentina" [level=3] [ref=e116]
          - generic [ref=e117]: Grupo J
      - generic [ref=e118]:
        - paragraph [ref=e119]: Sus partidos en fase de grupos
        - generic [ref=e120]:
          - button "Algeria Argentina vs Argelia 16 jun · 22:00 · Kansas City AST · Buenos Aires ›" [ref=e121] [cursor=pointer]:
            - img "Algeria" [ref=e122]
            - generic [ref=e123]:
              - paragraph [ref=e124]: Argentina vs Argelia
              - paragraph [ref=e125]: 16 jun · 22:00 · Kansas City
              - paragraph [ref=e126]: AST · Buenos Aires
            - generic [ref=e127]: ›
          - button "Austria Argentina vs Austria 22 jun · 14:00 · Dallas AST · Buenos Aires ›" [ref=e128] [cursor=pointer]:
            - img "Austria" [ref=e129]
            - generic [ref=e130]:
              - paragraph [ref=e131]: Argentina vs Austria
              - paragraph [ref=e132]: 22 jun · 14:00 · Dallas
              - paragraph [ref=e133]: AST · Buenos Aires
            - generic [ref=e134]: ›
          - button "Jordan Jordania vs Argentina 27 jun · 23:00 · Dallas AST · Buenos Aires ›" [ref=e135] [cursor=pointer]:
            - img "Jordan" [ref=e136]
            - generic [ref=e137]:
              - paragraph [ref=e138]: Jordania vs Argentina
              - paragraph [ref=e139]: 27 jun · 23:00 · Dallas
              - paragraph [ref=e140]: AST · Buenos Aires
            - generic [ref=e141]: ›
    - generic [ref=e143]:
      - paragraph [ref=e146]: Predicción especial
      - heading "¿Quién va a ganar el Mundial?" [level=3] [ref=e147]
      - paragraph [ref=e148]: Una predicción antes del inicio. Se bloquea el 11 de junio con el primer partido.
      - generic [ref=e149]:
        - paragraph [ref=e150]: Elige un campeón entre las 48 selecciones
        - generic [ref=e151]:
          - button "México MEX" [ref=e152] [cursor=pointer]:
            - img "México" [ref=e153]
            - generic [ref=e154]: MEX
          - button "Sudáfrica RSA" [ref=e155] [cursor=pointer]:
            - img "Sudáfrica" [ref=e156]
            - generic [ref=e157]: RSA
          - button "Corea del Sur KOR" [ref=e158] [cursor=pointer]:
            - img "Corea del Sur" [ref=e159]
            - generic [ref=e160]: KOR
          - button "Chequia CZE" [ref=e161] [cursor=pointer]:
            - img "Chequia" [ref=e162]
            - generic [ref=e163]: CZE
          - button "Canadá CAN" [ref=e164] [cursor=pointer]:
            - img "Canadá" [ref=e165]
            - generic [ref=e166]: CAN
          - button "Bosnia y Herzegovina BIH" [ref=e167] [cursor=pointer]:
            - img "Bosnia y Herzegovina" [ref=e168]
            - generic [ref=e169]: BIH
          - button "Catar QAT" [ref=e170] [cursor=pointer]:
            - img "Catar" [ref=e171]
            - generic [ref=e172]: QAT
          - button "Suiza SUI" [ref=e173] [cursor=pointer]:
            - img "Suiza" [ref=e174]
            - generic [ref=e175]: SUI
          - button "Brasil BRA" [ref=e176] [cursor=pointer]:
            - img "Brasil" [ref=e177]
            - generic [ref=e178]: BRA
          - button "Marruecos MAR" [ref=e179] [cursor=pointer]:
            - img "Marruecos" [ref=e180]
            - generic [ref=e181]: MAR
          - button "Haití HAI" [ref=e182] [cursor=pointer]:
            - img "Haití" [ref=e183]
            - generic [ref=e184]: HAI
          - button "Escocia SCO" [ref=e185] [cursor=pointer]:
            - img "Escocia" [ref=e186]
            - generic [ref=e187]: SCO
          - button "Estados Unidos USA" [ref=e188] [cursor=pointer]:
            - img "Estados Unidos" [ref=e189]
            - generic [ref=e190]: USA
          - button "Paraguay PAR" [ref=e191] [cursor=pointer]:
            - img "Paraguay" [ref=e192]
            - generic [ref=e193]: PAR
          - button "Australia AUS" [ref=e194] [cursor=pointer]:
            - img "Australia" [ref=e195]
            - generic [ref=e196]: AUS
          - button "Turquía TUR" [ref=e197] [cursor=pointer]:
            - img "Turquía" [ref=e198]
            - generic [ref=e199]: TUR
          - button "Alemania GER" [ref=e200] [cursor=pointer]:
            - img "Alemania" [ref=e201]
            - generic [ref=e202]: GER
          - button "Curazao CUW" [ref=e203] [cursor=pointer]:
            - img "Curazao" [ref=e204]
            - generic [ref=e205]: CUW
          - button "Costa de Marfil CIV" [ref=e206] [cursor=pointer]:
            - img "Costa de Marfil" [ref=e207]
            - generic [ref=e208]: CIV
          - button "Ecuador ECU" [ref=e209] [cursor=pointer]:
            - img "Ecuador" [ref=e210]
            - generic [ref=e211]: ECU
          - button "Países Bajos NED" [ref=e212] [cursor=pointer]:
            - img "Países Bajos" [ref=e213]
            - generic [ref=e214]: NED
          - button "Japón JPN" [ref=e215] [cursor=pointer]:
            - img "Japón" [ref=e216]
            - generic [ref=e217]: JPN
          - button "Suecia SWE" [ref=e218] [cursor=pointer]:
            - img "Suecia" [ref=e219]
            - generic [ref=e220]: SWE
          - button "Túnez TUN" [ref=e221] [cursor=pointer]:
            - img "Túnez" [ref=e222]
            - generic [ref=e223]: TUN
          - button "Bélgica BEL" [ref=e224] [cursor=pointer]:
            - img "Bélgica" [ref=e225]
            - generic [ref=e226]: BEL
          - button "Egipto EGY" [ref=e227] [cursor=pointer]:
            - img "Egipto" [ref=e228]
            - generic [ref=e229]: EGY
          - button "Irán IRN" [ref=e230] [cursor=pointer]:
            - img "Irán" [ref=e231]
            - generic [ref=e232]: IRN
          - button "Nueva Zelanda NZL" [ref=e233] [cursor=pointer]:
            - img "Nueva Zelanda" [ref=e234]
            - generic [ref=e235]: NZL
          - button "España ESP" [ref=e236] [cursor=pointer]:
            - img "España" [ref=e237]
            - generic [ref=e238]: ESP
          - button "Cabo Verde CPV" [ref=e239] [cursor=pointer]:
            - img "Cabo Verde" [ref=e240]
            - generic [ref=e241]: CPV
          - button "Arabia Saudita KSA" [ref=e242] [cursor=pointer]:
            - img "Arabia Saudita" [ref=e243]
            - generic [ref=e244]: KSA
          - button "Uruguay URU" [ref=e245] [cursor=pointer]:
            - img "Uruguay" [ref=e246]
            - generic [ref=e247]: URU
          - button "Francia FRA" [ref=e248] [cursor=pointer]:
            - img "Francia" [ref=e249]
            - generic [ref=e250]: FRA
          - button "Senegal SEN" [ref=e251] [cursor=pointer]:
            - img "Senegal" [ref=e252]
            - generic [ref=e253]: SEN
          - button "Noruega NOR" [ref=e254] [cursor=pointer]:
            - img "Noruega" [ref=e255]
            - generic [ref=e256]: NOR
          - button "Irak IRQ" [ref=e257] [cursor=pointer]:
            - img "Irak" [ref=e258]
            - generic [ref=e259]: IRQ
          - button "Argentina ARG" [ref=e260] [cursor=pointer]:
            - img "Argentina" [ref=e261]
            - generic [ref=e262]: ARG
          - button "Argelia ALG" [ref=e263] [cursor=pointer]:
            - img "Argelia" [ref=e264]
            - generic [ref=e265]: ALG
          - button "Austria AUT" [ref=e266] [cursor=pointer]:
            - img "Austria" [ref=e267]
            - generic [ref=e268]: AUT
          - button "Jordania JOR" [ref=e269] [cursor=pointer]:
            - img "Jordania" [ref=e270]
            - generic [ref=e271]: JOR
          - button "Portugal POR" [ref=e272] [cursor=pointer]:
            - img "Portugal" [ref=e273]
            - generic [ref=e274]: POR
          - button "Congo RD COD" [ref=e275] [cursor=pointer]:
            - img "Congo RD" [ref=e276]
            - generic [ref=e277]: COD
          - button "Uzbekistán UZB" [ref=e278] [cursor=pointer]:
            - img "Uzbekistán" [ref=e279]
            - generic [ref=e280]: UZB
          - button "Colombia COL" [ref=e281] [cursor=pointer]:
            - img "Colombia" [ref=e282]
            - generic [ref=e283]: COL
          - button "Inglaterra ENG" [ref=e284] [cursor=pointer]:
            - img "Inglaterra" [ref=e285]
            - generic [ref=e286]: ENG
          - button "Croacia CRO" [ref=e287] [cursor=pointer]:
            - img "Croacia" [ref=e288]
            - generic [ref=e289]: CRO
          - button "Ghana GHA" [ref=e290] [cursor=pointer]:
            - img "Ghana" [ref=e291]
            - generic [ref=e292]: GHA
          - button "Panamá PAN" [ref=e293] [cursor=pointer]:
            - img "Panamá" [ref=e294]
            - generic [ref=e295]: PAN
    - generic [ref=e297]:
      - generic [ref=e298]: Tu identidad
      - heading "Personaliza tu perfil de hincha para que la app represente a tu selección." [level=2] [ref=e299]
      - paragraph [ref=e300]: Las apps deportivas más fuertes usan nombre real, equipo favorito y una identidad visual coherente para que la experiencia se sienta personal y competitiva.
      - generic [ref=e301]:
        - generic [ref=e302]:
          - generic [ref=e303]:
            - generic [ref=e304]: Q
            - generic [ref=e305]:
              - paragraph [ref=e306]: Imagen de perfil
              - paragraph [ref=e307]: Puedes usar tu foto social, subir una propia o dejar la bandera de tu selección favorita como identidad visual.
              - generic [ref=e308]:
                - button "Usar foto social" [ref=e309] [cursor=pointer]
                - button "Usar bandera favorita" [ref=e310] [cursor=pointer]
          - generic [ref=e311]:
            - generic [ref=e312]: Subir nueva foto
            - button "Subir nueva foto Ningún archivo seleccionado" [ref=e313]
            - generic [ref=e314]: Ningún archivo seleccionado
        - generic [ref=e315]:
          - generic [ref=e316]: Nombre visible
          - textbox "Nombre visible" [ref=e317]: QA Test User
        - generic [ref=e318]:
          - generic [ref=e319]: Selección favorita
          - combobox "Selección favorita" [ref=e320]:
            - option "Selecciona una selección"
            - option "Alemania"
            - option "Arabia Saudita"
            - option "Argelia"
            - option "Argentina" [selected]
            - option "Australia"
            - option "Austria"
            - option "Bélgica"
            - option "Bosnia y Herzegovina"
            - option "Brasil"
            - option "Cabo Verde"
            - option "Canadá"
            - option "Catar"
            - option "Chequia"
            - option "Colombia"
            - option "Congo RD"
            - option "Corea del Sur"
            - option "Costa de Marfil"
            - option "Croacia"
            - option "Curazao"
            - option "Ecuador"
            - option "Egipto"
            - option "Escocia"
            - option "España"
            - option "Estados Unidos"
            - option "Francia"
            - option "Ghana"
            - option "Haití"
            - option "Inglaterra"
            - option "Irak"
            - option "Irán"
            - option "Japón"
            - option "Jordania"
            - option "Marruecos"
            - option "México"
            - option "Noruega"
            - option "Nueva Zelanda"
            - option "Países Bajos"
            - option "Panamá"
            - option "Paraguay"
            - option "Portugal"
            - option "Senegal"
            - option "Sudáfrica"
            - option "Suecia"
            - option "Suiza"
            - option "Túnez"
            - option "Turquía"
            - option "Uruguay"
            - option "Uzbekistán"
        - generic [ref=e321]:
          - checkbox "Quiero recibir recordatorios por email Te avisaremos antes del cierre si todavía no has enviado tu predicción final." [ref=e322]
          - generic [ref=e323]:
            - paragraph [ref=e324]: Quiero recibir recordatorios por email
            - paragraph [ref=e325]: Te avisaremos antes del cierre si todavía no has enviado tu predicción final.
        - generic [ref=e326]:
          - generic [ref=e327]: Idioma
          - combobox "Idioma" [ref=e328]:
            - option "Español" [selected]
            - option "English"
            - option "Français"
            - option "Deutsch"
            - option "Português"
            - option "Italiano"
            - option "Indonesia"
            - option "한국어"
            - option "日本語"
            - option "العربية"
            - option "עברית"
        - generic [ref=e329]:
          - generic [ref=e330]: Zona horaria
          - paragraph [ref=e331]: America/Argentina/Buenos_Aires
          - paragraph [ref=e332]: Detectada automáticamente según el dispositivo
        - button "Guardar perfil" [ref=e334] [cursor=pointer]
    - generic [ref=e335]:
      - generic [ref=e337]:
        - heading "Próximos partidos" [level=3] [ref=e338]
        - paragraph [ref=e339]: Vista rápida del día. Guardado en Supabase con borradores y envío final.
      - generic [ref=e340]:
        - article [ref=e342]:
          - generic [ref=e344]:
            - generic [ref=e345]:
              - paragraph [ref=e346]: Grupo A
              - paragraph [ref=e347]: 11 jun 2026
              - paragraph [ref=e348]: AST
            - generic [ref=e349]:
              - paragraph [ref=e350]: 16:00
              - paragraph [ref=e351]: AST
          - generic [ref=e352]:
            - button "Bandera de México México MEX" [ref=e353] [cursor=pointer]:
              - img "Bandera de México" [ref=e354]
              - generic [ref=e355]:
                - paragraph [ref=e356]: México
                - paragraph [ref=e357]: MEX
            - generic [ref=e358]:
              - generic [ref=e359]:
                - generic [ref=e360]: L
                - textbox "L" [ref=e361]:
                  - /placeholder: "0"
              - generic [ref=e362]: "-"
              - generic [ref=e363]:
                - generic [ref=e364]: V
                - textbox "V" [ref=e365]:
                  - /placeholder: "0"
            - button "Sudáfrica RSA Bandera de Sudáfrica" [ref=e366] [cursor=pointer]:
              - generic [ref=e367]:
                - paragraph [ref=e368]: Sudáfrica
                - paragraph [ref=e369]: RSA
              - img "Bandera de Sudáfrica" [ref=e370]
          - generic [ref=e371]:
            - paragraph [ref=e372]: Ciudad de México
            - paragraph [ref=e373]: Nueva
          - generic [ref=e375]:
            - generic [ref=e376]:
              - paragraph [ref=e377]: Transmisión local
              - paragraph [ref=e378]: Detectado para EEUU (español)
            - paragraph [ref=e379]: Telemundo · Universo · Peacock
          - generic [ref=e380]:
            - button "Guardar" [ref=e381] [cursor=pointer]
            - button "Enviar" [ref=e382] [cursor=pointer]
        - article [ref=e384]:
          - generic [ref=e386]:
            - generic [ref=e387]:
              - paragraph [ref=e388]: Grupo A
              - paragraph [ref=e389]: 12 jun 2026
              - paragraph [ref=e390]: AST
            - generic [ref=e391]:
              - paragraph [ref=e392]: 01:00
              - paragraph [ref=e393]: AST
          - generic [ref=e394]:
            - button "Bandera de Corea del Sur Corea del Sur KOR" [ref=e395] [cursor=pointer]:
              - img "Bandera de Corea del Sur" [ref=e396]
              - generic [ref=e397]:
                - paragraph [ref=e398]: Corea del Sur
                - paragraph [ref=e399]: KOR
            - generic [ref=e400]:
              - generic [ref=e401]:
                - generic [ref=e402]: L
                - textbox "L" [ref=e403]:
                  - /placeholder: "0"
              - generic [ref=e404]: "-"
              - generic [ref=e405]:
                - generic [ref=e406]: V
                - textbox "V" [ref=e407]:
                  - /placeholder: "0"
            - button "Chequia CZE Bandera de Chequia" [ref=e408] [cursor=pointer]:
              - generic [ref=e409]:
                - paragraph [ref=e410]: Chequia
                - paragraph [ref=e411]: CZE
              - img "Bandera de Chequia" [ref=e412]
          - generic [ref=e413]:
            - paragraph [ref=e414]: Guadalajara
            - paragraph [ref=e415]: Nueva
          - generic [ref=e417]:
            - generic [ref=e418]:
              - paragraph [ref=e419]: Transmisión local
              - paragraph [ref=e420]: Detectado para EEUU (español)
            - paragraph [ref=e421]: Telemundo · Universo · Peacock
          - generic [ref=e422]:
            - button "Guardar" [ref=e423] [cursor=pointer]
            - button "Enviar" [ref=e424] [cursor=pointer]
        - article [ref=e426]:
          - generic [ref=e428]:
            - generic [ref=e429]:
              - paragraph [ref=e430]: Grupo B
              - paragraph [ref=e431]: 12 jun 2026
              - paragraph [ref=e432]: AST
            - generic [ref=e433]:
              - paragraph [ref=e434]: 16:00
              - paragraph [ref=e435]: AST
          - generic [ref=e436]:
            - button "Bandera de Canadá Canadá CAN" [ref=e437] [cursor=pointer]:
              - img "Bandera de Canadá" [ref=e438]
              - generic [ref=e439]:
                - paragraph [ref=e440]: Canadá
                - paragraph [ref=e441]: CAN
            - generic [ref=e442]:
              - generic [ref=e443]:
                - generic [ref=e444]: L
                - textbox "L" [ref=e445]:
                  - /placeholder: "0"
              - generic [ref=e446]: "-"
              - generic [ref=e447]:
                - generic [ref=e448]: V
                - textbox "V" [ref=e449]:
                  - /placeholder: "0"
            - button "Bosnia y Herzegovina BIH Bandera de Bosnia y Herzegovina" [ref=e450] [cursor=pointer]:
              - generic [ref=e451]:
                - paragraph [ref=e452]: Bosnia y Herzegovina
                - paragraph [ref=e453]: BIH
              - img "Bandera de Bosnia y Herzegovina" [ref=e454]
          - generic [ref=e455]:
            - paragraph [ref=e456]: Toronto
            - paragraph [ref=e457]: Nueva
          - generic [ref=e459]:
            - generic [ref=e460]:
              - paragraph [ref=e461]: Transmisión local
              - paragraph [ref=e462]: Detectado para EEUU (español)
            - paragraph [ref=e463]: Telemundo · Universo · Peacock
          - generic [ref=e464]:
            - button "Guardar" [ref=e465] [cursor=pointer]
            - button "Enviar" [ref=e466] [cursor=pointer]
        - article [ref=e468]:
          - generic [ref=e470]:
            - generic [ref=e471]:
              - paragraph [ref=e472]: Grupo D
              - paragraph [ref=e473]: 12 jun 2026
              - paragraph [ref=e474]: AST
            - generic [ref=e475]:
              - paragraph [ref=e476]: 22:00
              - paragraph [ref=e477]: AST
          - generic [ref=e478]:
            - button "Bandera de Estados Unidos Estados Unidos USA" [ref=e479] [cursor=pointer]:
              - img "Bandera de Estados Unidos" [ref=e480]
              - generic [ref=e481]:
                - paragraph [ref=e482]: Estados Unidos
                - paragraph [ref=e483]: USA
            - generic [ref=e484]:
              - generic [ref=e485]:
                - generic [ref=e486]: L
                - textbox "L" [ref=e487]:
                  - /placeholder: "0"
              - generic [ref=e488]: "-"
              - generic [ref=e489]:
                - generic [ref=e490]: V
                - textbox "V" [ref=e491]:
                  - /placeholder: "0"
            - button "Paraguay PAR Bandera de Paraguay" [ref=e492] [cursor=pointer]:
              - generic [ref=e493]:
                - paragraph [ref=e494]: Paraguay
                - paragraph [ref=e495]: PAR
              - img "Bandera de Paraguay" [ref=e496]
          - generic [ref=e497]:
            - paragraph [ref=e498]: Los Ángeles
            - paragraph [ref=e499]: Nueva
          - generic [ref=e501]:
            - generic [ref=e502]:
              - paragraph [ref=e503]: Transmisión local
              - paragraph [ref=e504]: Detectado para EEUU (español)
            - paragraph [ref=e505]: Telemundo · Universo · Peacock
          - generic [ref=e506]:
            - button "Guardar" [ref=e507] [cursor=pointer]
            - button "Enviar" [ref=e508] [cursor=pointer]
    - generic [ref=e509]:
      - generic [ref=e511]:
        - heading "Ranking" [level=3] [ref=e512]
        - paragraph [ref=e513]: Se activará cuando empiece el Mundial y existan resultados oficiales para puntuar.
      - generic [ref=e515]:
        - generic [ref=e516]:
          - paragraph [ref=e517]: Pretorneo
          - heading "El ranking todavía no comenzó." [level=3] [ref=e518]
          - paragraph [ref=e519]: Los puntos y posiciones aparecerán recién cuando haya partidos oficiales disputados, resultados confirmados y predicciones cerradas para evaluar.
        - generic [ref=e520]:
          - paragraph [ref=e521]: Estado
          - paragraph [ref=e522]: 0 usuarios puntuados
          - paragraph [ref=e523]: Esperando inicio del torneo
```

# Test source

```ts
  1   | import { test, expect } from './fixtures/authenticated.js';
  2   | 
  3   | async function openPredictionsTab(page) {
  4   |   const btn = page
  5   |     .locator('nav[aria-label="Primary"] button')
  6   |     .filter({ hasText: /predic/i })
  7   |     .first();
  8   | 
  9   |   if (await btn.isVisible().catch(() => false)) {
  10  |     await btn.click();
  11  |   } else {
> 12  |     await page.locator('nav').last().locator('button').filter({ hasText: /predic/i }).first().click();
      |                                                                                               ^ TimeoutError: locator.click: Timeout 10000ms exceeded.
  13  |   }
  14  | 
  15  |   await page.waitForSelector('article', { timeout: 10_000 });
  16  | }
  17  | 
  18  | async function getFirstMatchCard(page) {
  19  |   // The first match card with prediction inputs
  20  |   return page.locator('article').filter({ has: page.locator('input[type="number"]') }).first();
  21  | }
  22  | 
  23  | async function openPrediction(page) {
  24  |   await openPredictionsTab(page);
  25  | 
  26  |   // Click the first match card to open its prediction drawer/modal
  27  |   const card = page.locator('article').first();
  28  |   await card.click();
  29  | 
  30  |   // Wait for score inputs to appear
  31  |   await page.waitForSelector('input[type="number"][min="0"]', {
  32  |     state: 'visible',
  33  |     timeout: 8_000,
  34  |   });
  35  | }
  36  | 
  37  | test.describe('PREDICTIONS — score input behaviour', () => {
  38  |   test('Blur on empty home input auto-fills "0"', async ({ page }) => {
  39  |     await openPrediction(page);
  40  | 
  41  |     const inputs = page.locator('input[type="number"][min="0"]');
  42  |     const homeInput = inputs.first();
  43  | 
  44  |     // Clear and blur
  45  |     await homeInput.fill('');
  46  |     await homeInput.blur();
  47  |     await page.waitForTimeout(200);
  48  | 
  49  |     await expect(homeInput).toHaveValue('0');
  50  |   });
  51  | 
  52  |   test('Blur on empty away input auto-fills "0"', async ({ page }) => {
  53  |     await openPrediction(page);
  54  | 
  55  |     const inputs = page.locator('input[type="number"][min="0"]');
  56  |     const awayInput = inputs.nth(1);
  57  | 
  58  |     await awayInput.fill('');
  59  |     await awayInput.blur();
  60  |     await page.waitForTimeout(200);
  61  | 
  62  |     await expect(awayInput).toHaveValue('0');
  63  |   });
  64  | 
  65  |   test('Filled value is preserved on blur', async ({ page }) => {
  66  |     await openPrediction(page);
  67  | 
  68  |     const inputs = page.locator('input[type="number"][min="0"]');
  69  |     const homeInput = inputs.first();
  70  | 
  71  |     await homeInput.fill('3');
  72  |     await homeInput.blur();
  73  |     await page.waitForTimeout(200);
  74  | 
  75  |     await expect(homeInput).toHaveValue('3');
  76  |   });
  77  | 
  78  |   test('Both inputs together: blur empty → both become "0"', async ({ page }) => {
  79  |     await openPrediction(page);
  80  | 
  81  |     const inputs = page.locator('input[type="number"][min="0"]');
  82  |     await inputs.first().fill('');
  83  |     await inputs.nth(1).fill('');
  84  |     await inputs.first().blur();
  85  |     await inputs.nth(1).blur();
  86  |     await page.waitForTimeout(200);
  87  | 
  88  |     await expect(inputs.first()).toHaveValue('0');
  89  |     await expect(inputs.nth(1)).toHaveValue('0');
  90  |   });
  91  | });
  92  | 
  93  | test.describe('PREDICTIONS — submit flow', () => {
  94  |   test('Submitting prediction shows ENVIADA / SENT badge', async ({ page }) => {
  95  |     // Mock the Supabase upsert so it returns 200
  96  |     await page.route('**/rest/v1/predictions**', (route) => {
  97  |       if (route.request().method() === 'POST' || route.request().method() === 'PATCH') {
  98  |         route.fulfill({ status: 201, body: '[]', headers: { 'Content-Type': 'application/json' } });
  99  |       } else {
  100 |         route.continue();
  101 |       }
  102 |     });
  103 | 
  104 |     await openPrediction(page);
  105 | 
  106 |     const inputs = page.locator('input[type="number"][min="0"]');
  107 |     await inputs.first().fill('2');
  108 |     await inputs.nth(1).fill('1');
  109 | 
  110 |     // Click the submit/send button
  111 |     const submitBtn = page.locator(
  112 |       'button:has-text("Enviar"), button:has-text("Submit"), button:has-text("Guardar"), button:has-text("Save")'
```