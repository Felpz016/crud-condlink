# Testar a API pelo terminal (curl)

Passos 17 a 23 do roteiro. Rode no **PowerShell**, sempre com `curl.exe` (com `.exe`).

```powershell
[Console]::OutputEncoding = [Text.Encoding]::UTF8
$API = "https://us-central1-earnest-cosmos-175020.cloudfunctions.net"

# 1. Login (copie o exemplo e ponha usuário e senha SÓ na cópia, que está no .gitignore)
Copy-Item curl/login.example.json curl/login.json
code curl/login.json
$login = curl.exe -s -X POST "$API/app-login/v1/login" -H "Content-Type: application/json" --data-binary "@curl/login.json" | ConvertFrom-Json
$TOKEN = $login.token
$H = "Authorization: Bearer $TOKEN"

# 2. Unidade e lista (GET)
curl.exe -s "$API/app-pessoa-me/v1/pessoa/me" -H $H
$URL = "$API/app-residente-manage/v1/residente/"
curl.exe -s "${URL}?page=1&page_size=100" -H $H

# 3. Cadastrar (POST) - antes, troque o CPF/username do novo-morador.json por um inventado só seu
$novo = curl.exe -s -X POST $URL -H $H -H "Content-Type: application/json" --data-binary "@curl/novo-morador.json" | ConvertFrom-Json
$ID = $novo.data.id

# 4. Editar (PUT)
curl.exe -s -X PUT "$URL$ID" -H $H -H "Content-Type: application/json" --data-binary "@curl/editar-morador.json"

# 5. Inativar (DELETE) e conferir que continua no banco com ativo: false
curl.exe -s -X DELETE "$URL$ID" -H $H
curl.exe -s "$URL$ID" -H $H
```

| Arquivo | Para quê | Vai para o Git? |
| --- | --- | --- |
| `login.example.json` | Modelo do corpo do login, sem senha | Sim |
| `login.json` | A cópia com a senha de teste | **Não** (`.gitignore`) |
| `novo-morador.json` | Corpo do POST (cadastro) | Sim |
| `editar-morador.json` | Corpo do PUT (edição) | Sim |
