# Electroteca
## Sistema de Xestión de Inventario de Equipos Electrónicos

**Memoria do Proxecto de Fin de Ciclo**
Ciclo Formativo de Grao Superior en Desenvolvemento de Aplicacións Web

---

**Autor:** Jonathan Caamaño
**Empresa:** jcrlabs, S.L.
**Data:** Maio 2026
**Versión da aplicación:** v0.3.12

---

---

## ÍNDICE

1. [Explicación do proxecto](#1-explicación-do-proxecto)
2. [Xustificación da necesidade no contorno produtivo](#2-xustificación-da-necesidade-no-contorno-produtivo)
3. [Tecnoloxías empregadas e xustificación da súa escolla](#3-tecnoloxías-empregadas-e-xustificación-da-súa-escolla)
4. [Diagramas](#4-diagramas)
5. [Decisións de deseño](#5-decisións-de-deseño)
6. [Asignación de recursos e orzamento](#6-asignación-de-recursos-e-orzamento)
7. [Despregamento da aplicación](#7-despregamento-da-aplicación)
8. [Tempos de execución](#8-tempos-de-execución)
9. [Liñas futuras](#9-liñas-futuras)

[Introdución](#introdución)
[Conclusións](#conclusións)
[Bibliografía](#bibliografía)

---

---

## INTRODUCIÓN

O sector da reparación de equipos electrónicos é un dos máis activos no tecido de pemes e microempresas da rexión. Talleres de reparación de móbiles, ordenadores, electrodomésticos e outro equipamento electrónico xestionan a diario decenas de dispositivos en diferentes fases de diagnóstico e reparación. Con todo, a maioría destes establecementos operate sen ningunha ferramenta dixital especializada, recorrendo a follas de cálculo, blocs de papel ou, no mellor dos casos, sistemas xenéricos de xestión que non se adaptan ás súas necesidades específicas.

Electroteca nace como resposta directa a esta carencia. Trátase dunha aplicación web de xestión de inventario especializada no ciclo de vida de equipos electrónicos en proceso de reparación ou almacenamento. A través dunha interface moderna, accesible e multilingüe, permite aos talleres e almacéns técnicos rexistrar, catalogar, facer un seguimento do estado e xestionar o inventario de pezas e equipos, desde a entrada do dispositivo ata a súa entrega ao cliente ou descarte.

Este documento constitúe a memoria técnica do proxecto, elaborada no marco do ciclo formativo de Grao Superior en Desenvolvemento de Aplicacións Web. Nel descríbese a motivación e necesidade do proxecto, as tecnoloxías elixidas e a razón da súa elección, a arquitectura e deseño da solución, a planificación temporal e económica e as liñas de evolución futura.

---

---

## 1. EXPLICACIÓN DO PROXECTO

### 1.1 Descrición xeral

Electroteca é unha aplicación web de tipo SaaS (*Software as a Service*) orientada á xestión de inventario de equipos e compoñentes electrónicos. Está pensada para talleres de reparación, almacéns técnicos e pequenas empresas do sector da electrónica que necesitan levar un control dixital e centralizado dos seus equipos, o seu estado de reparación e o seu historial.

A aplicación permite:

- **Rexistrar produtos**: equipos electrónicos (ordenadores, placas base, monitores, compoñentes) con nome, descrición, categoría, estado, prezo e galerías fotográficas.
- **Seguimento do estado**: cada produto ten asignado un estado (reparado, en progreso, non reparado) que pode actualizarse en calquera momento.
- **Xestión de categorías**: agrupación dos produtos por categorías personalizables (procesadores, almacenamento, periféricos, etc.).
- **Contactos asociados**: cada produto pode ter un contacto (cliente ou proveedor) vinculado con nome, correo electrónico e teléfono.
- **Galerías fotográficas**: carga de imaxes do equipo para documentar o seu estado físico.
- **Panel de estatísticas** (*dashboard*): visión xeral con métricas de estado do inventario.
- **Xestión de usuarios**: control de acceso baseado en roles (administrador, xestor, visualizador).
- **Multilingüismo**: interface dispoñible en galego, español e inglés.
- **Temas visuais**: modo escuro e modo claro, con persistencia da preferencia do usuario.

### 1.2 Arquitectura xeral

O sistema segue unha arquitectura cliente-servidor con separación clara entre o *frontend* e o *backend*:

- **Frontend**: aplicación de páxina única (*SPA*) construída con React e TypeScript, servida como arquivos estáticos a través dun servidor web Nginx.
- **Backend**: API REST construída en Go con Gin, que expón os recursos a través de HTTP e xestiona a autenticación, autorización e acceso aos datos.
- **Base de datos**: PostgreSQL como sistema de xestión de bases de datos relacionais.
- **Almacenamento de obxectos**: MinIO para o almacenamento e servizo das imaxes dos produtos.
- **Infraestrutura**: despregamento en clúster Kubernetes (k3s) con Helm, integración e entrega continua mediante GitHub Actions e ArgoCD.

A aplicación é accesible a través da URL `https://electroteca.jcrlabs.net` e está deseñada para ser usada desde calquera dispositivo con acceso web, tanto desde escritorio como desde dispositivos móbiles.

### 1.3 Funcionalidades principais por rol

| Funcionalidade | Visualizador | Xestor | Administrador |
|---|---|---|---|
| Ver produtos e categorías | ✓ | ✓ | ✓ |
| Ver *dashboard* | ✓ | ✓ | ✓ |
| Crear e editar produtos | — | ✓ | ✓ |
| Subir imaxes | — | ✓ | ✓ |
| Crear e editar categorías | — | ✓ | ✓ |
| Eliminar categorías | — | — | ✓ |
| Xestionar usuarios | — | — | ✓ |

### 1.4 Nome e identidade

O nome **Electroteca** combina "electrónica" e o sufixo "-teca" (do grego *theke*, colección, depósito), que evoca un lugar de almacenamento e catalogación organizada, igual que unha biblioteca ou fonoteca. Reflicte con precisión a natureza da aplicación: un repositorio catalogado de equipos electrónicos.

---

---

## 2. XUSTIFICACIÓN DA NECESIDADE NO CONTORNO PRODUTIVO

### 2.1 Análise do contorno PEST

#### 2.1.1 Contorno económico

O sector da reparación electrónica en España experimentou un notable crecemento nos últimos anos, impulsado pola conciencia medioambiental e o encarecemento dos equipos novos. Segundo datos do Instituto Nacional de Estadística (INE), o número de empresas dedicadas á reparación de ordenadores e equipos de comunicacións creceu un 12 % entre 2020 e 2024.

As pemes e microempresas que operan neste sector —en Galicia existen máis de 800 establecementos dedicados á reparación de equipos electrónicos segundo o Directorio Central de Empresas (DIRCE)— carecen na súa maior parte de ferramentas de xestión dixital específicas para o seu sector. Os sistemas ERP (*Enterprise Resource Planning*) xenéricos son excesivamente complexos e custosos para este tipo de negocio, mentres que as solucións específicas para talleres de reparación son escasas e de difícil acceso.

#### 2.1.2 Contorno político e legal

O Regulamento Europeo de Dereito a Reparar (Directiva UE 2024/1799, en vigor desde xullo de 2024) obriga aos fabricantes a facilitar a reparación dos seus produtos durante un mínimo de dez anos, o que implica un impulso directo ao sector da reparación de electrónica. Esta normativa xera un marco favorable para o crecemento de talleres de reparación e, por extensión, para as ferramentas de xestión que lles dean soporte.

Ademais, o Regulamento Xeral de Protección de Datos (RXPD) esixe que calquera solución que xestione datos de contactos de clientes garde esas informacións de forma segura, con control de acceso e minimización de datos, requisitos que Electroteca cumpre mediante autenticación JWT, RBAC (*Role-Based Access Control*) e cifrado de contrasinais con bcrypt.

#### 2.1.3 Contorno social

A reparación de equipos electrónicos está en alza por dúas razóns sociais: a economía circular e o impacto medioambiental do lixo electrónico. A Unión Europea xerou 13,7 millóns de toneladas de residuos electrónicos en 2022 (Eurostat), e a concienciación social sobre este problema impulsa tanto a demanda de servizos de reparación como a necesidade de ferramentas que axuden a eses talleres a xestionar mellor o seu traballo.

Por outra parte, a pandemia acelerou a dixitalización das pemes, e moitos talleres que antes operaban en papel ou con follas de cálculo buscan agora solucións web accesibles desde calquera dispositivo.

#### 2.1.4 Contorno tecnolóxico

O avance en tecnoloxías web (frameworks de JavaScript modernos, API REST, contenedores Docker, orquestación Kubernetes) permite construír aplicacións robustas, escalables e seguras a custos moi reducidos. A dispoñibilidade de servizos na nube de baixo custo e a madurez de ferramentas de integración continua fan posible que un equipo pequeno poida manter e despregar unha aplicación con estándares de calidade profesional.

A adopción de estándares abertos (OpenAPI, JWT, OAuth 2.0) facilita a interoperabilidade e a posibilidade de integración futura con outros sistemas.

### 2.2 Análise do mercado obxectivo

#### 2.2.1 Perfil do cliente

Electroteca está orientada a:

- **Talleres de reparación de electrónica**: establecementos cunha plantilla de 1 a 10 persoas que reparan ordenadores, móbiles, televisores e electrodomésticos.
- **Almacéns de compoñentes electrónicos**: empresas que almacenan e venden pezas de segunda man.
- **Departamentos TI de empresas medianas**: que necesitan xestionar o inventario do equipamento informático da organización.
- **Coleccionistas e reparadores independentes**: que manteñen un rexistro dos equipos que adquiren, reparan e venden.

#### 2.2.2 Perfil do usuario final

Dentro de cada cliente, os usuarios da aplicación teñen perfís diferentes:

- **Técnicos de reparación**: acceden ao sistema para consultar o estado dos equipos que están a traballar e actualizar o progreso. Valoran a rapidez e a claridade da información.
- **Xestores do taller**: crean e editan o inventario, asignan categorías e contactos, consultan as estatísticas. Valoran a completitude da información e as funcionalidades de filtrado.
- **Propietarios e administradores**: supervisan o estado xeral do negocio a través do *dashboard* e xestionan os usuarios do sistema. Valoran a visión global e o control de acceso.

### 2.3 Proposta de valor

A proposta de valor de Electroteca fronte á competencia (follas de cálculo, ERP xenéricos ou soluciones de papel) baséase en:

1. **Especialización no sector**: deseñada especificamente para o fluxo de traballo de talleres de reparación electrónica.
2. **Accesibilidade**: interface web accesible desde calquera dispositivo, sen instalación, con soporte completo para dispositivos móbiles.
3. **Custo reducido**: modelo SaaS de subscrición mensual, sen inversión inicial en hardware nin licenzas.
4. **Multilingüismo**: soporte para galego, español e inglés, relevante para o contexto galego.
5. **Facilidade de uso**: curva de aprendizaxe mínima, interface intuitiva validada contra criterios WCAG 2.1.

### 2.4 Características profesionais e filosofía da empresa

**jcrlabs, S.L.** é unha empresa de desenvolvemento de software radicada en Galicia, fundada en 2024, especializada no deseño e desenvolvemento de aplicacións web. A súa filosofía baséase en tres principios:

- **Código aberto e estándares**: preferencia por tecnoloxías abertas, ben documentadas e con comunidades activas.
- **Calidade e seguridade por defecto**: a seguridade non é un extra; forma parte do proceso de desenvolvemento desde o primeiro día.
- **Deseño centrado no usuario**: a experiencia de uso é tan importante como a funcionalidade técnica.

A **visión** de jcrlabs é converterse na solución de referencia para a xestión de inventarios técnicos no mercado galego e español, comezando polo nicho de reparación electrónica e expandíndose a outros sectores técnicos.

Os **valores** que guían o traballo son: transparencia, rigor técnico, respecto polo usuario e responsabilidade coa privacidade dos datos.

En canto á **responsabilidade social corporativa (RSC)**, jcrlabs comprométese a contribuír á economía circular facilitando a xestión eficiente de talleres de reparación, alargando a vida útil dos equipos electrónicos e reducindo o lixo electrónico (RAEE). Ademais, apóiase en infraestrutura propia para reducir a dependencia de grandes plataformas e manter o control sobre os datos dos clientes.

---

---

## 3. TECNOLOXÍAS EMPREGADAS E XUSTIFICACIÓN DA SÚA ESCOLLA

### 3.1 Backend — Go con Gin

**Go** (versión 1.24) foi elixido como linguaxe do *backend* polos seguintes motivos:

- **Rendemento**: Go compila a código máquina nativo, o que ofrece latencias moi baixas nas respostas da API, comparables a C++ pero con un modelo de programación moito máis simple.
- **Concorrencia nativa**: as goroutines e os canais de Go permiten xestionar miles de solicitudes simultáneas con moi baixo consumo de memoria, sen a sobrecarga dos *threads* do sistema operativo.
- **Binario estático**: o resultado da compilación é un único binario sen dependencias externas, o que simplifica enormemente o *Dockerfile* e as actualizacións.
- **Tipado estático**: reduce os erros en tempo de execución e mellora a mantenibilidade do código.

**Gin** (v1.10) é o *router* HTTP empregado. A súa elección está xustificada pola súa alta velocidade (emprega o *router* httprouter baseado en Radix tree), o seu sistema de *middleware* modular e a ampla adopción na comunidade Go.

### 3.2 Frontend — React con TypeScript

**React** (v18.2) con **TypeScript** é o *framework* de interface de usuario elixido. As razóns son:

- **Ecosistema maduro**: React é a biblioteca de UI máis utilizada a nivel mundial, con gran cantidade de recursos, compoñentes e solucións probadas.
- **TypeScript**: o tipado estático no *frontend* prevén erros en tempo de desenvolvemento e mellora a autocompletación no IDE, o que acelera o desenvolvemento e reduce os bugs.
- **Modelo de compoñentes**: a arquitectura de compoñentes reutilizables permite construír a interface de forma modular e mantenible.
- **React Router v6**: xestión de rutas declarativa e compatible co modelo SPA (*Single Page Application*).

### 3.3 Vite como bundler

**Vite** (v5.2) substitúe a Create React App como ferramenta de construción. As súas vantaxes son:

- **Tempo de arranque instantáneo**: emprega módulos ES nativos do navegador en desenvolvemento, eliminando o paso de *bundling*.
- **HMR ultrarrápido** (*Hot Module Replacement*): os cambios no código reflíctense no navegador en menos de 50 ms.
- **Build optimizado**: usa Rollup para a construción en produción, con *tree-shaking* e minificación automática.

### 3.4 Tailwind CSS

**Tailwind CSS** (v3.4) é o *framework* de estilos empregado. Fronte a alternativas como Bootstrap ou Material UI, Tailwind ofrece:

- **Utilidades atómicas**: permite construír calquera deseño sen saír do HTML, sen capas de abstracción que dificulten a personalización.
- **Purge automático**: en produción só se inclúe o CSS que se utiliza realmente, resultando en follas de estilo de poucos quilobytes.
- **Sistema de tokens de deseño**: as variables de configuración (cores, espazo, tipografía) manteñen a coherencia visual en toda a aplicación.
- **Sen conflitos de especificidade**: o modelo de clases utilitarias evita os problemas de cascada CSS propios dos *frameworks* baseados en compoñentes estilizados.

### 3.5 Zustand para o estado global

**Zustand** (v4.5) é a biblioteca de xestión de estado global elixida en lugar de Redux ou Context API. A súa vantaxe principal é a súa extrema simplicidade: non require reducers, actions nin boilerplate. A tenda de autenticación (`useAuthStore`) con 30 liñas de código xestiona os tokens JWT, os datos do usuario e a persistencia en localStorage.

### 3.6 GORM con PostgreSQL

**GORM** (v1.30) é o ORM (*Object-Relational Mapper*) empregado no *backend* para a interacción coa base de datos PostgreSQL. As razóns da súa elección son:

- **Migracións automáticas**: `AutoMigrate` xera e aplica as alteracións de esquema a partir das structs de Go, reducindo a posibilidade de erros manuais.
- **Queries parametrizadas por defecto**: GORM nunca interpola valores do usuario directamente en SQL, eliminando o risco de inxección SQL.
- **Soporte completo para relacións**: asociacións `BelongsTo`, `HasMany`, `HasOne` xestionadas automaticamente con *eager loading* controlado.

**PostgreSQL** (v15) foi elixido como base de datos polo seu rigor ACID, o soporte para tipos de datos avanzados (UUID, JSONB, arrays), a súa fiabilidade demostrada en producción e a súa licenza de código aberto.

### 3.7 MinIO para almacenamento de obxectos

**MinIO** é o sistema de almacenamento de obxectos empregado para as imaxes dos produtos. É compatible coa API de Amazon S3, polo que calquera código escrito para MinIO funciona tamén con S3 sen cambios. A súa execución como servizo dentro do propio clúster Kubernetes elimina a dependencia de servizos externos de pago e garante que os datos permanecen no contorno controlado.

### 3.8 Tecnoloxías de infraestrutura e despregamento

#### 3.8.1 Docker e Kubernetes (k3s)

A aplicación está contenedorizada con **Docker** e despregada nun clúster **k3s** (a distribución lixeira de Kubernetes de Rancher). k3s reduce a sobrecarga de Kubernetes eliminando compoñentes non esenciais, sendo ideal para servidores con recursos limitados (VPS de 4 vCPU e 8 GB de RAM). A orquestación permite:

- Reinicio automático de pods en caso de fallo.
- Actualizacións sen *downtime* mediante `RollingUpdate`.
- Escalar horizontalmente os pods de *frontend* e *backend* de forma independente.

#### 3.8.2 Helm

Os manifestos de Kubernetes están encapsulados en **Helm charts**, que permiten parametrizar o despregamento (imaxe, réplicas, variables de contorno) e xestionar diferentes contornos (test, produción) mediante arquivos `values.yaml` separados.

#### 3.8.3 GitHub Actions e ArgoCD

O ciclo CI/CD (*Continuous Integration / Continuous Delivery*) está implementado con **GitHub Actions** para a fase de integración (tests, linting, construción da imaxe) e **ArgoCD** para a entrega continua. ArgoCD monitoriza o repositorio Git en busca de cambios no `values-prod.yaml` e sincroniza automaticamente o clúster co estado declarado, implementando o patrón GitOps.

### 3.9 Autenticación JWT con RS256

A autenticación implementa JWT (*JSON Web Tokens*) con algoritmo asimétrico **RS256** (RSA + SHA-256). As razóns da elección son:

- **Seguridade asimétrica**: a clave privada (para asinar) nunca sae do servidor; a clave pública (para verificar) pode distribuírse libremente.
- **Stateless**: o servidor non necesita almacenar sesións; calquera instancia do *backend* pode verificar un token coa clave pública.
- **Refresh tokens con rotación**: implementación de tokens de refresco con hash SHA-256 na base de datos e rotación automática para previr ataques de reutilización.

### 3.10 i18next para internacionalización

**i18next** (v26.0) con **react-i18next** (v17.0) xestiona as traducións da interface. Os arquivos de tradución están en formato JSON organizado por espazos de nomes (`products`, `categories`, `auth`, `common`). O cambio de idioma é instantáneo, sen recarga da páxina, e a preferencia persiste en localStorage.

---

---

## 4. DIAGRAMAS

### 4.1 Diagrama Entidade-Relación (E/R)

O modelo de datos da aplicación está composto por seis entidades principais:

```
users {
    UUID id PK
    VARCHAR username
    VARCHAR email
    VARCHAR role          -- admin | manager | viewer
    BOOLEAN active
}

categories {
    UUID id PK
    VARCHAR name
}

products {
    UUID id PK
    VARCHAR name
    VARCHAR sku
    UUID category_id FK   --> categories
    UUID created_by_id FK --> users
    VARCHAR status        -- reparado | en_progreso | no_reparado
    BOOLEAN paid
    NUMERIC price
}

contacts {
    UUID id PK
    UUID product_id FK    --> products
    VARCHAR name
    VARCHAR email
    VARCHAR phone
}

product_images {
    UUID id PK
    UUID product_id FK    --> products
    VARCHAR image_key     -- chave en MinIO
    INT position
}

refresh_tokens {
    UUID id PK
    UUID user_id FK       --> users
    VARCHAR token_hash    -- SHA-256 do token
    TIMESTAMPTZ expires_at
    BOOLEAN revoked
}

Relacións:
  users        ||--o{  products        : "crea"
  users        ||--o{  refresh_tokens  : "posee"
  categories   ||--o{  products        : "clasifica"
  products     ||--o|  contacts        : "ten"
  products     ||--o{  product_images  : "galería"
```

Todas as entidades usan **UUID v4** como clave primaria en lugar de enteiros autoincrementais, o que evita a enumeración dos recursos na API e simplifica a replicación futura.

### 4.2 Diagrama de Clases

O dominio do *backend* en Go está representado polas seguintes estruturas principais:

```
User
  + UUID id
  + string username
  + string email
  + Role role            [admin | manager | viewer]
  + bool active

Product
  + UUID id
  + string name
  + string sku
  + float64 price
  + ProductStatus status [reparado | en_progreso | no_reparado]
  + bool paid
  + UUID categoryId

Category
  + UUID id
  + string name
  + string description

Contact
  + UUID id
  + UUID productId
  + string name
  + string email
  + string phone

ProductImage
  + UUID id
  + UUID productId
  + string imageKey
  + int position

RefreshToken
  + UUID id
  + UUID userId
  + string tokenHash
  + bool revoked
  + time.Time expiresAt
```

Relacións:
- `User` → `[]*Product` (1 a moitos)
- `User` → `[]*RefreshToken` (1 a moitos)
- `Product` → `*Category` (moitos a 1)
- `Product` → `*Contact` (1 a 1, opcional)
- `Product` → `[]*ProductImage` (1 a moitos)

### 4.3 Arquitectura en capas do sistema

```
Frontend (React SPA)
  ├── Pages (UI + lóxica de páxina)
  ├── Components (compoñentes reutilizables)
  ├── Store (Zustand: auth, settings)
  └── API Client (Axios: interceptores JWT)
         │
         │ HTTPS / REST
         ▼
Backend (Go / Gin)
  ├── Router (rutas + grupos /api/v1)
  ├── Middleware (JWT auth, CORS, rate limit)
  ├── Handlers (controladores HTTP)
  ├── Services (lóxica de negocio)
  └── Repositories (acceso a datos)
         │
         ├── PostgreSQL (datos relacionais)
         └── MinIO (almacenamento de imaxes)

Infraestrutura
  ├── k3s (Kubernetes)
  ├── Helm Charts
  ├── GitHub Actions (CI)
  └── ArgoCD (CD / GitOps)
```

### 4.4 Fluxo de autenticación (secuencia)

```
Usuario → Frontend: introduce credenciais
Frontend → Backend: POST /api/auth/login { email, password }
Backend → PostgreSQL: consulta usuario por email
PostgreSQL → Backend: rexistro usuario
Backend: verifica bcrypt(password, hash)
Backend: xera access_token (JWT RS256, TTL 15 min)
Backend: xera refresh_token, almacena hash en BD
Backend → Frontend: { access_token, refresh_token }
Frontend: garda tokens en Zustand + localStorage

[Token expirado]
Frontend → Backend: POST /api/auth/refresh { refresh_token }
Backend: valida hash do refresh_token en BD
Backend: rota refresh_token (invalida o anterior)
Backend → Frontend: { access_token, refresh_token }
```

### 4.5 Control de acceso baseado en roles (RBAC)

```
Viewer  → le produtos, categorías, dashboard
Manager → todo o anterior + crear/editar produtos e imaxes
Admin   → todo o anterior + xestionar usuarios + eliminar categorías
```

O control de acceso aplícase en dous niveis:
1. **Middleware de ruta** no *backend*: cada ruta ten un `RoleGuard` que verifica que o rol do token JWT ten permiso para a operación solicitada.
2. **UI condicional** no *frontend*: os botóns e accións que o usuario non pode executar están ocultos ou desactivados segundo o rol almacenado no estado de autenticación.

---

---

## 5. DECISIÓNS DE DESEÑO

### 5.1 Maqueta estrutural

O deseño da interface partiuse de bocetos estruturais (*wireframes*) en papel e en formato dixital antes de comezar a implementación. As pantallas principais da aplicación —login, *dashboard*, lista de produtos, detalle de produto e formularios modais— foron esbozadas para definir a xerarquía de información e a distribución dos elementos antes de tomar ningunha decisión de cor ou tipografía.

A estrutura xeral da aplicación segue un patrón de **navegación lateral persistente** en escritorio: unha barra lateral fixa de 220 px na esquerda que contén o logotipo, os ítems de navegación, o selector de idioma e tema, e a información do usuario. O contido principal ocupa o espazo restante e desprazase verticalmente. En dispositivos móbiles, a barra lateral convértese nun menú deslizable oculto que se activa cun botón de menú.

As pantallas de autenticación (inicio de sesión e rexistro) prescinden da barra lateral e presentan o formulario centrado verticalmente na páxina, seguindo a convención estándar de aplicacións web que separa visualmente o espazo de acceso do espazo de traballo.

### 5.2 Sistema de cores

#### 5.2.1 Cor primaria: ámbar

O ámbar (`#f59e0b`, `amber-500` en Tailwind) foi elixido como cor primaria da aplicación por motivos funcionais e semánticos:

- **Asociación de dominio**: a cor do ámbar evoca a luz de soldadura, as chispas dos terminais eléctricos e a iluminación de taller. Esta asociación é inmediata para o usuario técnico que traballa nun contorno de reparación electrónica.
- **Accesibilidade en daltónicos**: o ámbar é claramente distinguible por persoas con deuteranopia (daltonismo vermello-verde, o tipo máis común, que afecta ao 8 % dos homes). Ao contrario do vermello ou o verde, o ámbar non se confunde con ningún dos outros dous estados de cor empregados na aplicación.
- **Contraste sobre negro**: o ámbar sobre fondo negro (`#111111`) acada ratios de contraste superiores a 7:1 (nivel AAA de WCAG 2.1), garantindo a máxima lexibilidade.

A paleta de ámbar empregada ten catro variantes: `#fbbf24` (amber-400, inicio do gradiente e iconos activos), `#f59e0b` (amber-500, cor base), `#d97706` (amber-600, final do gradiente e páxinación activa) e `#b45309` (amber-700, usado exclusivamente no tema claro para cumprir o ratio mínimo de contraste WCAG AA de 4.5:1 sobre fondo claro).

#### 5.2.2 Cores de estado

Os tres estados dos produtos están codificados por cor con iconos associados, cumprindo o criterio WCAG 1.4.1 de non transmitir información unicamente polo cor:

| Estado | Cor | Código | Icono |
|---|---|---|---|
| Reparado | Verde esmeralda | `#10b981` (emerald-500) | CheckCircle2 |
| En progreso | Ámbar | `#f59e0b` (amber-500) | Clock |
| Non reparado | Vermello | `#ef4444` (red-500) | XCircle |

Os fondos dos *badges* empregan estas cores con opacidade reducida ao 12 % (`rgba(cor, 0.12)`), evitando que dominen visualmente en páxinas con moitos elementos de estado simultáneos.

#### 5.2.3 Neutros: escala Zinc

Os fondos e textos empregan a escala **Zinc** de Tailwind (lixeiramente azulada fronte ao gris puro), que reduce a fatiga visual en sesións longas de uso. O fondo principal é `#111111` (case negro), xustificado por:

- Redución do lume de pantalla en contornos de taller con iluminación variable.
- Aforro enerxético en pantallas OLED.
- Contraste óptimo para o ámbar primario.

O sistema de tokens CSS (`--bg-base`, `--bg-nav`, `--bg-surface`, `--bg-card`, `--text-1`, `--text-2`, `--text-3`, `--border`) permite cambiar o tema completo actualizando só os valores das variables, sen modificar o código dos compoñentes.

#### 5.2.4 Tema claro

O tema claro mapea os tokens ao espectro oposto: `--bg-base: #f2f2f4`, `--text-1: #18181b`. Os *overrides* WCAG específicos aseguran que as cores de estado sigan sendo accesibles sobre fondos claros: o ámbar escurece a `#b45309` (4.9:1) e o vermello a `#be123c` (6.4:1).

### 5.3 Tipografía

**Inter** é a tipografía principal, importada de Google Fonts con pesos 300, 400, 500, 600, 700 e 800. A xustificación da súa elección:

- **Deseñada para pantallas**: Inter foi creada especificamente para lexibilidade en interfaces de alta densidade informacional.
- **Números tabulares**: o peso tipográfico dos dígitos é uniforme, o que facilita a comparación columnar en prezos, SKU e identificadores.
- **Soporte Unicode completo**: necesario para galego (vogais acentuadas, o carácter ñ, o dígrafo ll, etc.).

A xerarquía tipográfica emprégase sistematicamente: 32 px / 800 para títulos de páxina, 18 px / 700 para seccións, 14 px / 400 para corpo de texto e 11–12 px / 600–700 en maiúsculas con `tracking-wider` para etiquetas de formulario e *badges*.

### 5.4 Logotipo

O logotipo de Electroteca combina dous elementos:

1. **Chave inglesa** (*wrench*): símbolo universal de reparación e traballo técnico.
2. **Trazas de circuíto impreso** (PCB): contexto de electrónica e tecnoloxía.

A síntese visual comunica o dominio da aplicación de forma inmediata: xestión de equipos electrónicos en proceso de reparación. O gradiente ámbar-laranxa (`#fbbf24 → #d97706`) aplícase ao trazo da chave, e un efecto de *glow* radial (`rgba(245,158,11,0.18)`) centra a atención e reforza a sensación de "actividade" eléctrica do sistema.

O ficheiro do logotipo é SVG, o que garante que escale sen perda de calidade en calquera resolución, incluíndo pantallas Retina ou 4K. O efecto *glow* aplícase mediante `filter: drop-shadow` en CSS, sen aumentar o peso do arquivo.

### 5.5 Compoñentes visuais clave

#### 5.5.1 Tarxetas de produto

Cada produto preséntase nunha tarxeta (`ProductCard`) con:
- Carrusel de imaxes en proporción 16:9 (`aspect-video`).
- *Badge* de estado sobreimpreso na esquina superior dereita.
- Nome, categoría (en ámbar, xerarquicamente inferior), descrición e prezo.
- Botóns de edición e eliminación visibles en *hover* (escritorio) ou sempre visibles (móbil).
- Barra de acento vertical de 4 px na esquerda co cor do estado.

#### 5.5.2 Modais

Os formularios de creación e edición preséntanse en modais con:
- Cabeceira e pé fixos (*sticky*), contido central con *scroll* interno.
- *Backdrop* con `backdrop-blur: 2px` para manter o contexto visual.
- Animación `scale-in` (escala de 0.97 a 1.0 + translación vertical) de 180 ms con curva `cubic-bezier(0.16, 1, 0.3, 1)`, que simula físicas de resorte e resulta natural sen ser intrusiva.
- En móbil, o modal convértese en *bottom-sheet* con bordes superiores redondeados.

#### 5.5.3 Radios de bordo e sombras

- Botóns e *inputs*: `border-radius: 8px` (`rounded-xl`).
- Tarxetas e contedores: `border-radius: 16px` (`rounded-2xl`).
- *Badges* e píldoras: `border-radius: 9999px` (`rounded-full`).

A consistencia nos radios crea coherencia visual sen ser monótona: os elementos máis interactivos (botóns, *inputs*) son lixeiramente máis cadrados que os contedores de información (tarxetas), o que axuda ao usuario a identificar visualmente os elementos accionables.

### 5.6 Criterios de accesibilidade

A aplicación está deseñada para cumprir o nivel **WCAG 2.1 AA** en todas as pantallas. Os principais criterios implementados son:

#### 5.6.1 Contraste de cor (WCAG 1.4.3)

| Par de cores | Ratio | Nivel |
|---|---|---|
| `text-1` (#e4e4e7) sobre `bg-base` (#111111) | 13.8:1 | AAA |
| `text-2` (#a1a1aa) sobre `bg-base` (#111111) | 6.4:1 | AA |
| Texto negro sobre botón ámbar (gradiente) | 7.2:1 | AAA |
| Ámbar-700 (#b45309) sobre fondo claro (#f2f2f4) | 4.9:1 | AA |
| Rose-800 (#be123c) sobre fondo claro | 6.4:1 | AA |

#### 5.6.2 Foco visible (WCAG 2.4.7)

O selector `:focus-visible` aplica un anel de foco de 2 px en cor ámbar (`rgba(245,158,11,0.6)`) con `outline-offset: 2px` en todos os elementos interactivos. Non se usa `outline: none` sen alternativa. Isto garante que os usuarios de teclado poidan navegar pola interface sen perder a referencia visual da posición do foco.

#### 5.6.3 Estado non só por cor (WCAG 1.4.1)

Os *badges* de estado combinan tres elementos: cor de fondo + icono vectorial + texto. Isto garante que un usuario con calquera tipo de daltonismo pode identificar o estado dun produto sen depender exclusivamente do matiz de cor.

#### 5.6.4 Contraste de compoñentes UI (WCAG 1.4.11)

Os bordos dos *inputs* no tema claro empregan `rgba(0,0,0,0.35)`, que acada o ratio mínimo de 3:1 sobre fondo branco requirido para compoñentes non textuais.

#### 5.6.5 Información multilingüe (WCAG 3.1.2)

O atributo `lang` da páxina HTML declara o idioma activo. O cambio de idioma é instantáneo e accesible desde a barra lateral sen necesidade de recargar a páxina.

#### 5.6.6 Tamaño mínimo de áreas interactivas (WCAG 2.5.5)

Os botóns de acción teñen un mínimo de 32×32 px en todas as resolucións, e os botóns principais superan os 44 px de alto en dispositivos móbiles, cumprindo as directrices de iOS Human Interface Guidelines e Material Design.

### 5.7 Usabilidade

A usabilidade da aplicación avalíase fronte ás dez heurísticas de Nielsen:

1. **Visibilidade do estado do sistema**: os *badges* de estado, as notificacións *toast* e os *skeleton loaders* informan o usuario en todo momento sobre o estado do sistema e das operacións en curso.
2. **Coincidencia co mundo real**: o vocabulario empregado (reparado, en progreso, categoría, prezo, contacto) e os iconos (chave inglesa, caixa de produto, etiqueta) reflicten o mundo real do usuario técnico.
3. **Control e liberdade do usuario**: todos os modais pódense pechar con clic fóra do panel ou coa tecla Escape. As acciones destructivas requiren confirmación explícita mediante un diálogo de confirmación.
4. **Consistencia e estándares**: o sistema de deseño aplícase de forma uniforme: mesmos radios de bordo, mesma escala tipográfica, mesmos patróns de interacción (hover, foco, desactivado) en todos os compoñentes.
5. **Prevención de erros**: os formularios validan os datos antes do envío con React Hook Form. Os campos obrigatorios están marcados. O diálogo de confirmación prevén eliminacións accidentais.
6. **Recoñecemento antes que recordo**: as tarxetas de produto mostran imaxe, estado, categoría e prezo sen necesidade de abrir o detalle. Os filtros de estado son chips visibles en todo momento. As etiquetas dos formularios son sempre visibles.
7. **Flexibilidade e eficiencia**: dobre vista (cuadrícula e lista/táboa) adaptada a diferentes tipos de usuario. Busca textual en tempo real. Filtros por estado. Páxinación para coleccións grandes.
8. **Deseño estético e minimalista**: interface escura de alta densidade sen elementos decorativos innecesarios. O ámbar aparece exclusivamente en elementos de acción e énfase.
9. **Axuda ao usuario a recoñecer, diagnosticar e recuperarse de erros**: mensaxes de erro específicas por campo no formulario. O componente `ErrorBoundary` captura erros de renderización e presenta unha mensaxe de recuperación con opción de reintento.
10. **Axuda e documentación**: a interface é suficientemente intuitiva para non requirir documentación, pero existen *tooltips* e mensaxes de estado en todos os fluxos de traballo.

---

---

## 6. ASIGNACIÓN DE RECURSOS E ORZAMENTO

### 6.1 Forma xurídica e datos da empresa

**jcrlabs, S.L.** é unha Sociedade de Responsabilidade Limitada (S.L.), forma xurídica elixida polos seguintes motivos:

- **Limitación da responsabilidade**: o socio responde exclusivamente co capital aportado á sociedade, sen comprometer o patrimonio persoal.
- **Flexibilidade fiscal**: permite optar polo réxime de tributación de sociedades (Imposto de Sociedades, IS, tipo xeral do 25 % ou tipo reducido do 15 % para empresas de nova creación nos dous primeiros exercicios).
- **Credibilidade comercial**: a forma societaria mellora a percepción fronte a clientes e provedores respecto ao traballo como autónomo.
- **Capital mínimo**: o capital mínimo dunha S.L. é de 3.000 €, accesible para un proxecto de pequena escala.

A empresa está **radicada en Galicia**, o que permite acceder ás axudas da Xunta de Galicia para novas empresas de base tecnolóxica e ao programa de axudas Igape para pemes dixitais.

### 6.2 Recursos humanos

#### 6.2.1 Equipo inicial

Na fase inicial, jcrlabs conta cun único empregado: o/a propio/a fundador/a, que desempeña todas as funcións de desenvolvemento, deseño, administración de sistemas e atención ao cliente.

| Posto | Función | Réxime |
|---|---|---|
| Desenvolvedor/a full-stack (fundador/a) | Desenvolvemento, despregamento, soporte | Autónomo/a societario/a |

#### 6.2.2 Contrato e custo laboral

Como socio/a traballador/a da S.L., o/a fundador/a tributa no réxime de autónomos da Seguridade Social (RETA) como autónomo/a societario/a, cunha cota mínima de **317,07 € ao mes** (2026) para a base de cotización mínima do grupo 7 (cotización por continxencias comúns e profesionais). A partir de ingresos superiores a 1.700 € netos ao mes, a cota increméntase proporcionalmente segundo a táboa de cotas do novo sistema de cotización por ingresos reais vixente desde 2023.

O salario bruto anual estimado é de **24.000 €**, o que equivale a **2.000 € brutos/mes** ou aproximadamente **1.650 € netos/mes** (despois de IRPF e Seguridade Social do traballador). O custo total para a empresa inclúe:

| Concepto | Importe mensual |
|---|---|
| Salario bruto | 2.000,00 € |
| Cota autónomo/a societario/a (RETA) | 317,07 € |
| **Total custo laboral/mes** | **2.317,07 €** |
| **Total custo laboral/ano** | **27.804,84 €** |

A valoración da hora de traballo é de **25 €/hora** (2.000 € / 160 horas mensuais aproximadas en xornada parcial de 5 h/día, 4 días á semana). Esta taxa horaria úsase como referencia para presupuestar proxectos de desenvolvemento a medida.

#### 6.2.3 Prevención de riscos laborais e teletraballo

O traballo desenvólvese en modalidade de **teletraballo total** desde o domicilio. De acordo coa Lei 10/2021 de traballo a distancia, a empresa ten as seguintes obrigas:

- Facilitar ou compensar o equipamento necesario (ordenador, pantalla, conexión a internet).
- Realizar a avaliación de riscos do posto de teletraballo (ergonomía, iluminación, pantallas de visualización de datos).
- Garantir o dereito á desconexión dixital fóra do horario laboral.

Para o posto de traballo no domicilio, identificáronse os seguintes **riscos laborais**:
- Fatiga visual por uso prolongado de pantallas (medida preventiva: monitores con filtro de luz azul, norma 20-20-20).
- Trastornos musculoesqueléticos por postura sedentaria (medida preventiva: cadeira ergonómica, escritorio axustable en altura).
- Illamento social (medida preventiva: colaboracións con coworkings locais, asistencia periódica a eventos do sector).

### 6.3 Recursos materiais e infraestrutura

#### 6.3.1 Equipamento de traballo

| Elemento | Custo estimado | Vida útil |
|---|---|---|
| Ordenador portátil (16 GB RAM, SSD 512 GB) | 1.200 € | 4 anos |
| Pantalla externa 27" 4K | 400 € | 5 anos |
| Teclado e rato mecánico ergonómico | 120 € | 4 anos |
| SAI (*UPS*) para protección eléctrica | 80 € | 5 anos |
| **Total equipamento** | **1.800 €** | |
| **Amortización mensual** | **37,50 €/mes** | |

#### 6.3.2 Infraestrutura en nube (VPS e servizos)

| Servizo | Proveedor | Custo mensual |
|---|---|---|
| VPS 4 vCPU / 8 GB RAM / 100 GB SSD (k3s) | Hetzner Cloud (CX31) | 15,00 € |
| VPS 2 vCPU / 4 GB RAM (MinIO + backup) | Hetzner Cloud (CX21) | 8,00 € |
| Dominio `jcrlabs.net` | Namecheap | 1,00 € (amort. de 12 €/ano) |
| Certificados TLS (*Let's Encrypt*) | Automatizado (cert-manager) | 0,00 € |
| GitHub (repositorios privados + Actions) | GitHub Free/Pro | 4,00 € |
| **Total infraestrutura/mes** | | **28,00 €** |

#### 6.3.3 Ferramentas e subscricións de software

| Ferramenta | Custo mensual |
|---|---|
| JetBrains GoLand / WebStorm (IDE) | 20,00 € |
| Figma (deseño UI, plan profesional) | 12,00 € |
| 1Password (xestor de contrasinais) | 4,00 € |
| Google Workspace (correo corporativo) | 6,00 € |
| **Total software/mes** | **42,00 €** |

#### 6.3.4 Gastos de operación

| Concepto | Custo mensual |
|---|---|
| Electricidade e internet (teletraballo, parte proporcional estimada) | 50,00 € |
| Xestoría e contabilidade | 80,00 € |
| Seguros (responsabilidade civil, equipamento) | 25,00 € |
| Publicidade e márketing dixital | 100,00 € |
| **Total operación/mes** | **255,00 €** |

### 6.4 Resumo de custos mensuais

| Categoría | Custo mensual |
|---|---|
| Custo laboral | 2.317,07 € |
| Infraestrutura | 28,00 € |
| Software | 42,00 € |
| Operación | 255,00 € |
| Amortización equipamento | 37,50 € |
| **TOTAL** | **2.679,57 €** |
| **TOTAL ANUAL** | **32.154,84 €** |

### 6.5 Modelo de ingresos e viabilidade

#### 6.5.1 Modelo de negocio SaaS por subscrición

Electroteca comercialízase como un servizo de subscrición mensual (*Software as a Service*). Defínense dous plans:

| Plan | Prezo/mes | Usuarios incluídos | Almacenamento | Produtos |
|---|---|---|---|---|
| **Básico** | 19 € + IVE | 3 usuarios | 5 GB | Ilimitados |
| **Profesional** | 39 € + IVE | 10 usuarios | 25 GB | Ilimitados |

O modelo SaaS ofrece ingresos recorrentes e predecibles, que facilitan a planificación financeira e estabilizan o fluxo de caixa.

#### 6.5.2 Análise de punto de equilibrio (*break-even*)

Para cubrir os custos totais mensuais de **2.679,57 €**:

| Escenario | Clientes necesarios |
|---|---|
| Todo plan Básico (19 €) | **141 clientes** |
| Todo plan Profesional (39 €) | **69 clientes** |
| Mix 60 % Básico / 40 % Profesional | **105 clientes** |

Aínda que o número de clientes para alcanzar o punto de equilibrio no escenario conservador (141 clientes básicos) parece elevado para un proxecto de inicio, debe considerarse que:

1. O custo laboral é o principal componente (86 % do total). A medida que a base de clientes crece, este custo non aumenta linealmente.
2. Os custos de infraestrutura son moi baixos e escalan lentamente (o custo do VPS incrementaría en ~15 €/mes por cada 100 clientes adicionais, aproximadamente).
3. A previsión é alcanzar o punto de equilibrio no **ano 2 de operación**, cunha rampa de crecemento gradual.

#### 6.5.3 Proxección de ingresos a 3 anos

| Ano | Clientes estimados | Ingresos brutos anuais | Resultado estimado |
|---|---|---|---|
| Ano 1 | 30 (mix) | ~8.640 € | –23.514 € (fase de investimento) |
| Ano 2 | 90 (mix) | ~25.920 € | –6.234 € (próximo á viabilidade) |
| Ano 3 | 160 (mix) | ~46.080 € | +13.925 € (beneficio) |

No ano 1, o déficit finánciase mediante o capital inicial da S.L. (3.000 €) e a liña de financiación detallada na sección 6.6. No ano 3, o proxecto xera beneficios e permite reinvestir en novo desenvolvemento ou ampliar o equipo.

### 6.6 Financiación

A financiación do proxecto combina tres fontes:

1. **Capital propio**: 3.000 € de capital social mínimo da S.L., achegados polo/a fundador/a.

2. **Liña ICO Empresas y Emprendedores**: o Instituto de Crédito Oficial (ICO) ofrece liñas de préstamo para novas empresas de ata 12,5 millóns de euros con tipos de interese reducidos. Para este proxecto solicitaríase un préstamo de **15.000 €** a 5 anos con carencia de capital de 12 meses, destinado a cubrir os gastos operativos do primeiro ano. O custo financeiro estimado é dun tipo de interese entre o 5 % e o 7 % TAE.

3. **Axudas Igape para pemes dixitais (Xunta de Galicia)**: o Instituto Galego de Promoción Económica publica anualmente convocatorias de axudas a fondo perdido para proxectos de transformación dixital. Para proxectos de software como servizo, as axudas oscilan entre 3.000 € e 20.000 €. Solicitaríase a axuda da convocatoria 2026 en canto a empresa estea constituída.

### 6.7 Plan de márketing e acciones de promoción

#### 6.7.1 Márketing dixital

- **SEO (*Search Engine Optimization*)**: posicionamento nos buscadores para termos como "software xestión taller reparación electrónica", "inventario taller electrónica" e "software reparación ordenadores". Inclúe optimización do contido da web corporativa e do blog técnico de jcrlabs.

- **Google Ads**: campañas de anuncios de busca segmentadas por xeo-localización (Galicia, España) e palabras clave de alta intención de compra. Orzamento inicial de 50 €/mes.

- **LinkedIn**: presenza activa na rede profesional con publicacións sobre o sector da reparación electrónica, a economía circular e as ferramentas de xestión para pemes técnicas.

- **Demo en liña**: a aplicación dispón dunha conta de demostración con datos fictícios, accesible desde o portfolio corporativo en `home.jcrlabs.net` sen necesidade de rexistro. Isto reduce a fricción para que os potenciais clientes proben o produto antes de contratar.

- **Contido en video** (YouTube): tutoriais de uso da aplicación e casos de uso reais, optimizados para a busca en YouTube.

#### 6.7.2 Márketing tradicional

- **Asociacións do sector**: colaboración con asociacións de talleres de reparación de Galicia (AETEG, asociacións locais de comercio electrónico) para chegar de forma directa ao público obxectivo.

- **Feiras e eventos**: presenza en feiras de tecnoloxía e pemes de Galicia (como o Salon del Automóvil de Vigo ou Expocoruña) con demostración en directo do produto.

- **Referidos**: programa de referidos que ofrece un mes gratuíto ao cliente que recomende a aplicación a un novo subscribiente.

---

---

## 7. DESPREGAMENTO DA APLICACIÓN

### 7.1 Opcións avaliadas

Para o despregamento da aplicación avaluáronse as seguintes opcións:

| Opción | Custo mensual est. | Complexidade | Control | Vantaxes |
|---|---|---|---|---|
| Hetzner VPS + k3s (opción elixida) | ~23 € | Alta | Total | Custo baixo, control total, persistencia |
| DigitalOcean App Platform | ~50 €–80 € | Baixa | Medio | Facilidade, CI/CD integrado |
| AWS ECS + RDS | ~120 €–200 € | Media | Medio | Escalabilidade, servizos xestionados |
| Vercel (frontend) + Railway (backend) | ~30 €–50 € | Baixa | Baixo | Rápido de configurar |
| Google Cloud Run + Cloud SQL | ~60 €–100 € | Media | Medio | Autoescalado, serverless |

### 7.2 Xustificación da opción elixida: Hetzner VPS + k3s

Elíxese **Hetzner Cloud con k3s** polos seguintes motivos:

1. **Custo**: dous servidores VPS en Hetzner supoñen un custo de ~23 €/mes, fronte aos 50–200 € das plataformas xestionadas. Para un proxecto en fase inicial, esta diferenza é determinante.

2. **Control total sobre os datos**: os datos dos clientes almacénanse nun servidor propio, sen depender de terceiros que poidan cambiar as súas políticas de privacidade ou os seus prezos. Isto é un argumento de venda fundamental para clientes sensibles á privacidade dos seus datos de inventario.

3. **Transferencia de coñecemento**: a xestión dun clúster Kubernetes real supón un investimento de aprendizaxe que aumenta as capacidades técnicas do equipo e é valorado no contorno produtivo.

4. **Hetzner como proveedor europeo**: o servidor está radicado en centros de datos en Alemaña e Finlandia, dentro da UE, o que simplifica o cumprimento do RXPD sen necesidade de cláusulas contractuais estándar para a transferencia de datos a terceiros países.

5. **Escalabilidade futura**: k3s permite engadir nodos ao clúster en calquera momento, e Helm facilita o despregamento de novas instancias da aplicación para clientes de maior escala.

### 7.3 Arquitectura de despregamento

```
DNS (Cloudflare)
  → electroteca.jcrlabs.net → Traefik (Ingress Controller, k3s)
                                ├── inventory-front (Nginx, 2 pods)
                                └── inventory-back (Go API, 2 pods)

Clúster k3s (VPS principal, 4 vCPU / 8 GB)
  ├── namespace: inventory
  │     ├── Deployment: inventory-front (2 réplicas)
  │     ├── Deployment: inventory-back  (2 réplicas)
  │     ├── Service: ClusterIP para cada Deployment
  │     └── Ingress: rutas HTTP/S con TLS
  ├── namespace: storage
  │     └── StatefulSet: MinIO
  └── namespace: data
        └── StatefulSet: PostgreSQL (con PersistentVolumeClaim)

VPS secundario (2 vCPU / 4 GB)
  └── MinIO en modo standalone (backup e almacenamento de obxectos)
```

### 7.4 CI/CD con GitHub Actions e ArgoCD

O fluxo de integración e entrega continua é o seguinte:

1. O desenvolvedor fai `git push` na rama `main` co tag de versión (`git tag v0.X.Y`).
2. **GitHub Actions** activa o *workflow* de CD:
   a. Constrúe a imaxe Docker e faible `push` ao rexistro de contedores de GitHub (GHCR).
   b. Actualiza o arquivo `deploy/helm/values-prod.yaml` co novo tag de imaxe.
   c. Fai `commit + push` do arquivo actualizado ao repositorio.
3. **ArgoCD** detecta o cambio en `values-prod.yaml` e sincroniza o clúster k3s:
   a. Aplica o Helm chart con `RollingUpdate`, substituíndo un pod á vez para evitar *downtime*.
   b. Verifica que os novos pods están saudables antes de eliminar os antigos.
4. ArgoCD notifica o resultado da sincronización (éxito ou erro) mediante webhook.

### 7.5 Seguridade no despregamento

- **TLS automático**: `cert-manager` xestiona os certificados TLS de *Let's Encrypt*, que se renovan automaticamente cada 60 días.
- **Secretos de Kubernetes**: as variables de contorno sensibles (contrasinais de BD, claves JWT RSA, credenciais MinIO) almacénanse en **Kubernetes Secrets**, nunca en texto plano nos manifestos Git.
- **Red Policy**: os pods de `inventory-front` e `inventory-back` non teñen acceso directo entre si; a comunicación vai sempre a través dos servizos de Kubernetes.
- **Non Root containers**: os contenedores execútanse con usuario non privilexiado (UID 1001) para minimizar o impacto dun posible comprometimento.

---

---

## 8. TEMPOS DE EXECUCIÓN

### 8.1 Fases do proxecto

O desenvolvemento do proxecto divídese en seis fases:

| Fase | Descrición | Duración |
|---|---|---|
| 1. Análise e planificación | Análise de requisitos, deseño da arquitectura, wireframes, especificación da API (OpenAPI) | 2 semanas |
| 2. Configuración de infraestrutura | VPS, k3s, PostgreSQL, MinIO, GitHub Actions, ArgoCD | 1 semana |
| 3. Desenvolvemento do backend | Modelos, migracións, repositorios, servizos, handlers, autenticación JWT, control de acceso | 4 semanas |
| 4. Desenvolvemento do frontend | Compoñentes, páxinas, xestión de estado, i18n, temas, integración API | 4 semanas |
| 5. Probas, corrección de bugs e accesibilidade | Probas de integración, revisión WCAG, corrección de erros, optimización de rendemento | 2 semanas |
| 6. Despregamento e documentación | Despregamento en produción, memoria técnica, preparación da presentación | 1 semana |
| **TOTAL** | | **14 semanas** |

### 8.2 Diagrama de Gantt

```
SEMANA          │ 1  2  3  4  5  6  7  8  9 10 11 12 13 14
────────────────┼────────────────────────────────────────────
1. Análise      │ ██ ██
2. Infra        │       ██
3. Backend      │          ██ ██ ██ ██
4. Frontend     │                      ██ ██ ██ ██
5. Probas/A11y  │                                  ██ ██
6. Deploy/Docs  │                                        ██ ██
────────────────┼────────────────────────────────────────────
MILESTONES      │          ▲           ▲           ▲
                │       MVP Backend  MVP App   Beta pública
```

**Milestones principais:**
- **Semana 3**: MVP do *backend* con autenticación e CRUD de produtos funcional.
- **Semana 11**: Versión alfa completa con todas as funcionalidades implementadas.
- **Semana 13**: Beta pública con todos os erros críticos corrixidos e accesibilidade validada.
- **Semana 14**: Lanzamento da versión 1.0 en produción.

### 8.3 Distribución do esforzo

| Fase | Horas estimadas | % do total |
|---|---|---|
| Análise e deseño | 40 h | 14 % |
| Infraestrutura e DevOps | 20 h | 7 % |
| Backend | 80 h | 28 % |
| Frontend | 80 h | 28 % |
| Probas e accesibilidade | 40 h | 14 % |
| Documentación e despregamento | 25 h | 9 % |
| **TOTAL** | **285 h** | **100 %** |

A valoración económica do proxecto a 25 €/hora de desenvolvemento supón un **custo total de desenvolvemento de 7.125 €**, que é o investimento inicial en traballo para pór o produto en marcha.

---

---

## 9. LIÑAS FUTURAS

O proxecto conta con varias liñas de evolución identificadas para versións futuras:

### 9.1 Funcionalidades a curto prazo (v1.x)

- **Notificacións por correo**: alertas automáticas ao contacto cando o estado dun produto cambia, mediante integración con SMTP ou servizos como Resend.
- **Exportación de datos**: exportación do inventario a CSV ou Excel para integración con outros sistemas.
- **Historial de cambios**: rexistro de todas as modificacións de estado dun produto (*audit log*), coa información do usuario que realizou o cambio e a data.
- **Busca avanzada**: filtrado por rango de prezos, datas de creación e múltiples categorías simultáneas.
- **Vista de impresión**: xeneración de fichas de produto en PDF para entregar ao cliente ou arquivar fisicamente.

### 9.2 Funcionalidades a medio prazo (v2.x)

- **Multi-taller**: soporte para que un usuario administre varios talleres desde a mesma conta, con datos illados por taller (*multi-tenancy*).
- **API pública**: exposición dunha API REST documentada con OpenAPI para que terceiros poidan integrar Electroteca cos seus propios sistemas.
- **Integración con plataformas de segunda man**: publicación automática de equipos en *marketplaces* como Wallapop, eBay ou Milanuncios desde a propia aplicación.
- **Aplicación móbil nativa**: desenvolvemento dunha aplicación iOS/Android con React Native, que permita escanear códigos de barras ou QR para rexistrar produtos de forma máis rápida.

### 9.3 Evolución técnica

- **Probas automatizadas**: cobertura de tests de integración co *backend* empregando test containers e tests de compoñentes no *frontend* con Vitest e Testing Library.
- **Observabilidade**: integración de Prometheus e Grafana para a monitorización de métricas da aplicación (latencia, taxa de erros, uso de recursos).
- **Cache con Redis**: introdución de Redis como capa de cache para as consultas máis frecuentes (lista de categorías, *dashboard*), reducindo a carga sobre PostgreSQL.
- **Busca con Elasticsearch**: para inventarios de gran tamaño (miles de produtos), substitución da busca SQL por un motor de busca dedicado.
- **Internacionalización ampliada**: soporte para portugués (mercado do norte de Portugal próximo a Galicia) e outros idiomas europeos.

---

---

## CONCLUSIÓNS

Electroteca é un proxecto que responde a unha necesidade real e documentada no sector dos talleres de reparación de electrónica: a ausencia de ferramentas de xestión dixital específicas, accesibles e de baixo custo adaptadas ao fluxo de traballo de pequenos negocios técnicos.

Desde o punto de vista técnico, o proxecto permitiu aplicar e integrar as tecnoloxías e metodoloxías traballadas ao longo do ciclo formativo: deseño de bases de datos relacionais, desenvolvemento de API REST, construción de interfaces modernas con *frameworks* de JavaScript, xestión de estado, autenticación segura con JWT, contenerización con Docker, orquestación con Kubernetes e implantación de CI/CD. Ademais, incorporáronse tecnoloxías novidosas non abordadas nos módulos do ciclo, como Go/Gin para o *backend*, k3s para a orquestación lixeira, ArgoCD para o patrón GitOps e MinIO para o almacenamento de obxectos.

Desde o punto de vista de deseño, o proxecto demostra que é posible construír interfaces accesibles, multilingües e con soporte para múltiples temas visuais (escuro e claro) cun sistema de tokens CSS ben definido e sen dependencia de bibliotecas de compoñentes de terceiros. Os criterios de accesibilidade WCAG 2.1 integráronse desde o inicio do desenvolvemento, non como un paso final de auditoría, senón como parte das decisións de deseño de cada compoñente.

Desde o punto de vista empresarial, a análise de viabilidade demostra que o proxecto é viable no horizonte de tres anos, cunha previsión conservadora de crecemento de clientes e un modelo de ingresos recorrentes SaaS que proporciona estabilidade financeira. O plan de márketing dixital e a demo en liña integrada no portfolio corporativo de jcrlabs constitúen a principal estratexia de captación de clientes nun primeiro momento.

En definitiva, Electroteca non é só un proxecto de fin de ciclo: é o primeiro produto real de jcrlabs, deseñado para ser despregado en produción, mantido e evolucionado ao longo do tempo coa incorporación de novas funcionalidades e a expansión a novos mercados.

---

---

## BIBLIOGRAFÍA

### Documentación oficial de tecnoloxías

- Go Programming Language. *Effective Go*. Dispoñible en: https://go.dev/doc/effective_go
- Gin Web Framework. *Gin Documentation*. Dispoñible en: https://gin-gonic.com/docs/
- React. *React Documentation*. Dispoñible en: https://react.dev
- Tailwind CSS. *Tailwind CSS Documentation*. Dispoñible en: https://tailwindcss.com/docs
- Vite. *Vite Guide*. Dispoñible en: https://vitejs.dev/guide/
- GORM. *GORM Documentation*. Dispoñible en: https://gorm.io/docs/
- MinIO. *MinIO Documentation*. Dispoñible en: https://min.io/docs/minio/linux/index.html
- Kubernetes. *Kubernetes Documentation*. Dispoñible en: https://kubernetes.io/docs/home/
- Helm. *Helm Documentation*. Dispoñible en: https://helm.sh/docs/
- ArgoCD. *ArgoCD User Guide*. Dispoñible en: https://argo-cd.readthedocs.io/en/stable/

### Estándares de accesibilidade e deseño

- W3C Web Accessibility Initiative. *Web Content Accessibility Guidelines (WCAG) 2.1*. Dispoñible en: https://www.w3.org/TR/WCAG21/
- Nielsen, J. *10 Usability Heuristics for User Interface Design*. Nielsen Norman Group. Dispoñible en: https://www.nngroup.com/articles/ten-usability-heuristics/
- Inter Font. *Inter – The typeface for screens*. Dispoñible en: https://rsms.me/inter/

### Lexislación e normativa

- Parlamento Europeo. *Regulamento (UE) 2024/1799 do Parlamento Europeo e do Consello relativo ao dereito a reparar*. Diario Oficial da Unión Europea, L series, 2024.
- Parlamento Europeo e do Consello. *Regulamento (UE) 2016/679 relativo á protección das persoas físicas no que respecta ao tratamento de datos persoais (RXPD)*. Diario Oficial da Unión Europea, L 119, 4 de maio de 2016.
- España. *Lei 10/2021, de 9 de xullo, de traballo a distancia*. Boletín Oficial do Estado, núm. 164, 10 de xullo de 2021.

### Fontes económicas e sectoriais

- Instituto Nacional de Estadística (INE). *Directorio Central de Empresas (DIRCE) 2024*. Dispoñible en: https://www.ine.es
- Eurostat. *WEEE statistics 2022: Waste electrical and electronic equipment in the EU*. Dispoñible en: https://ec.europa.eu/eurostat
- Seguridade Social. *Sistema de cotización por ingresos reais dos traballadores autónomos (2026)*. Dispoñible en: https://www.seg-social.es
- Instituto de Crédito Oficial. *Líneas ICO Empresas y Emprendedores 2026*. Dispoñible en: https://www.ico.es

### Recursos técnicos consultados

- Lucide Icons. *Lucide — Beautiful & consistent icon toolkit*. Dispoñible en: https://lucide.dev
- JWT.io. *JSON Web Tokens — Introduction*. Dispoñible en: https://jwt.io/introduction
- OpenAPI Initiative. *OpenAPI Specification 3.0*. Dispoñible en: https://spec.openapis.org/oas/v3.0.3
- Hetzner Online GmbH. *Hetzner Cloud documentation*. Dispoñible en: https://docs.hetzner.com/cloud/

---

*Memoria redactada en galego conforme ás normas ortográficas e morfolóxicas da lingua galega vixentes, aprobadas pola Real Academia Galega e o Instituto da Lingua Galega.*

*jcrlabs, S.L. — Maio 2026*
