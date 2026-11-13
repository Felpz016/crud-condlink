# Instala as dependências (só na primeira vez), liga o Expo e abre o simulador de celular
# no navegador do PC. Uso: .\iniciar.cmd  (ou dois cliques nele no Explorer)
$ErrorActionPreference = 'Continue'
Set-Location $PSScriptRoot

# O endereço da API mora no .env, que não vai para o GitHub. Na primeira vez,
# ele é criado a partir do .env.example (que tem o mesmo conteúdo).
if (-not (Test-Path .env)) {
  Copy-Item .env.example .env
  Write-Host 'Criei o arquivo .env a partir do .env.example.' -ForegroundColor Cyan
}

if (-not (Test-Path node_modules)) {
  Write-Host 'Instalando as dependências (só na primeira vez)...' -ForegroundColor Cyan
  npm install
}

# Abre o simulador (o app numa moldura de celular) assim que o Expo estiver respondendo.
$simulador = 'http://localhost:8081/simulador.html'
Start-Job -ArgumentList $simulador {
  param($url)
  for ($i = 0; $i -lt 180; $i++) {
    try {
      Invoke-WebRequest $url -UseBasicParsing -TimeoutSec 2 -ErrorAction Stop | Out-Null
      Start-Process $url
      break
    } catch {
      Start-Sleep -Seconds 1
    }
  }
} | Out-Null

Write-Host ''
Write-Host "O simulador vai abrir no navegador: $simulador" -ForegroundColor Green
Write-Host 'A primeira carga demora um pouco. Salvou um arquivo? O app atualiza sozinho.' -ForegroundColor Green
Write-Host 'O QR code para o Expo Go continua aqui no terminal. Para sair: tecla q.' -ForegroundColor Green
Write-Host ''
npx expo start -c
