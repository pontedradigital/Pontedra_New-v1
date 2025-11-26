# Pacote de Ícones e Favicons – Pontedra

## Estrutura de Pastas
- `/public/favicons`: `favicon-16.ico`, `favicon-32.ico`, `favicon-48.ico`
- `/public/ios`: `apple-touch-icon-60x60.png`, `76x76.png`, `120x120.png`, `152x152.png`, `180x180.png`
- `/public/android`: `android-chrome-192x192.png`, `android-chrome-512x512.png`
- `/public/windows`: `mstile-144x144.png`
- `/public/safari-pinned-tab.svg`: ícone para pinned tabs
- `/public/site.webmanifest`, `/public/manifest.webapp`, `/public/browserconfig.xml`

## Meta Tags (HTML)
Incluídas em `index.html` no `<head>`.

```html
<link rel="icon" sizes="16x16" href="/favicons/favicon-16.ico" />
<link rel="icon" sizes="32x32" href="/favicons/favicon-32.ico" />
<link rel="icon" sizes="48x48" href="/favicons/favicon-48.ico" />
<link rel="apple-touch-icon" sizes="60x60" href="/ios/apple-touch-icon-60x60.png" />
<link rel="apple-touch-icon" sizes="76x76" href="/ios/apple-touch-icon-76x76.png" />
<link rel="apple-touch-icon" sizes="120x120" href="/ios/apple-touch-icon-120x120.png" />
<link rel="apple-touch-icon" sizes="152x152" href="/ios/apple-touch-icon-152x152.png" />
<link rel="apple-touch-icon" sizes="180x180" href="/ios/apple-touch-icon-180x180.png" />
<link rel="manifest" href="/site.webmanifest" />
<link rel="mask-icon" href="/safari-pinned-tab.svg" color="#57e389" />
<meta name="msapplication-TileColor" content="#0c1624" />
<meta name="msapplication-config" content="/browserconfig.xml" />
```

## Manifestos
- `site.webmanifest`: ícones Android e iOS para PWA
- `manifest.webapp`: compatibilidade legada
- `browserconfig.xml`: tiles do Windows 8/10

## Geração e Otimização
- Script: `scripts/generate-icons.mjs`
- Base vetorial: `public/pontedra-logo.svg`
- Ferramentas: `sharp` para rasterizar SVG, `png-to-ico` para `.ico`
- Fundo transparente aplicado em PNG e `.ico`

### Relatório de Otimização
- Tamanhos reduzidos: imagens geradas sob medida (16–512px) sem redimensionamento em runtime
- Qualidade visual: rasterização a partir SVG com preservação de proporções e cores
- Compatibilidade cruzada: ícones e arquivos de configuração cobrindo iOS, Android, Windows e Safari pinned tabs

## Testes de Compatibilidade
- Chrome/Android: verificação do `manifest` e ícones 192/512
- iOS/Safari: validação dos `apple-touch-icon` e `mask-icon`
- Windows/Edge: leitura de `browserconfig.xml`

