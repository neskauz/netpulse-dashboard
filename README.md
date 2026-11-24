# NETPULSE — Network Monitoring Dashboard

Dashboard web para acompanhamento básico de dispositivos de rede, desenvolvido com **HTML, CSS, JavaScript e Python**.

## Visão geral

O NETPULSE consulta dispositivos cadastrados por endereço IP, verifica a conectividade por meio de `ping` e apresenta os resultados em um painel com indicadores de disponibilidade e latência.

## Funcionalidades

- Consulta de disponibilidade dos dispositivos por ping.
- Identificação de dispositivos online e offline.
- Exibição da latência estimada em milissegundos.
- Indicadores de quantidade de dispositivos, online e offline.
- Filtros por estado de conexão.
- Histórico local das medições e gráfico de latência.
- Atualização manual e automática do painel.

## Tecnologias

- **HTML5** — estrutura da interface.
- **CSS3** — layout e identidade visual.
- **JavaScript** — atualização do painel, filtros, histórico e gráfico.
- **Python 3** — servidor HTTP local e execução dos testes de conectividade.

## Executar localmente

O monitoramento real depende do servidor Python em execução na máquina que consegue alcançar os dispositivos da rede.

1. Instale o Python 3 e o [uv](https://docs.astral.sh/uv/).
2. Clone este repositório:
   ```bash
   git clone https://github.com/neskauz/netpulse-dashboard.git
   cd netpulse-dashboard
   ```
3. Inicie o servidor:
   ```bash
   uv run --python 3.13 python monitor.py
   ```
4. Abra no navegador:
   ```text
   http://127.0.0.1:8000
   ```

A API local que fornece os resultados fica disponível em:

```text
http://127.0.0.1:8000/api/devices
```

Mantenha o terminal aberto enquanto utilizar o painel. Para encerrar o servidor, pressione `Ctrl + C`.

## Configuração dos dispositivos

Os nomes e endereços monitorados ficam na lista `DEVICES`, no início de `monitor.py`. Substitua os endereços de exemplo pelos IPs dos dispositivos que você tem autorização para monitorar.

O estado **online** indica que o dispositivo respondeu ao ping. O estado **offline** indica que não houve resposta; isso também pode ocorrer quando o equipamento ou a rede bloqueia ICMP.

A latência apresentada pelo código atual é o tempo total de execução do comando de ping, usado como estimativa. Ela não representa necessariamente a medição ICMP exata exibida pelo próprio comando.

## Demonstração e limitações

O GitHub Pages pode hospedar os arquivos estáticos da interface, mas não executa o servidor Python. Portanto, a consulta real à rede local funciona quando o projeto é executado localmente com `monitor.py`. Uma página publicada no GitHub Pages, isoladamente, não consegue consultar os dispositivos da rede privada.

## Estrutura do projeto

```text
netpulse-dashboard/
├── index.html
├── style.css
├── script.js
├── monitor.py
└── README.md
```

## Objetivo

Projeto de portfólio para praticar desenvolvimento web, integração entre JavaScript e Python, fundamentos de redes e monitoramento de conectividade.
