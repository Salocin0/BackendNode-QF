# Genera las portadas de los eventos demo de QuickFood (1200x675, 16:9).
# Uso: powershell -File tools/generate_event_images.ps1
# Se ejecuta a mano; las imagenes quedan versionadas en el repo.
Add-Type -AssemblyName System.Drawing

$outDir = Join-Path $PSScriptRoot "..\src\public\images"
$W = 1200
$H = 675

$gold  = [System.Drawing.Color]::FromArgb(197, 161, 69)
$dark  = [System.Drawing.Color]::FromArgb(26, 26, 26)
$white = [System.Drawing.Color]::FromArgb(245, 245, 245)

$events = @(
  @{ File = "evento-cosquin-rock.jpg";        Title = "Cosquin Rock";                  Sub = "Villa Maria - Cordoba";       Accent = @(200, 60, 60) },
  @{ File = "evento-cerveza-artesanal.jpg";   Title = "Festival de Cerveza Artesanal"; Sub = "Villa Maria - Cordoba";       Accent = @(214, 150, 40) },
  @{ File = "evento-feria-emprendedores.jpg"; Title = "Feria de Emprendedores";        Sub = "Villa Maria - Cordoba";       Accent = @(60, 150, 120) },
  @{ File = "evento-jazz-verano.jpg";         Title = "Festival de Jazz de Verano";    Sub = "Anfiteatro Municipal";        Accent = @(90, 90, 190) },
  @{ File = "evento-expo-rural.jpg";          Title = "Exposicion Rural";              Sub = "Sociedad Rural - Villa Maria"; Accent = @(110, 150, 60) },
  @{ File = "evento-corso-carnaval.jpg";      Title = "Corso de Carnaval";             Sub = "Av. Sabattini - Villa Maria"; Accent = @(200, 90, 160) },
  @{ File = "evento-rock-nacional.jpg";       Title = "Recital de Rock Nacional";      Sub = "Estadio Municipal";           Accent = @(170, 70, 70) },
  @{ File = "evento-kermes-solidaria.jpg";    Title = "Kermes Solidaria";              Sub = "Club Atletico - Villa Maria"; Accent = @(70, 140, 190) },
  @{ File = "evento-expo-gastronomica.jpg";   Title = "Expo Gastronomica";             Sub = "Rio Ctalamochita";            Accent = @(200, 120, 50) },
  @{ File = "evento-fiesta-patronal.jpg";     Title = "Fiesta Patronal";               Sub = "Barrio San Martin";           Accent = @(180, 140, 70) },
  @{ File = "evento-doma-folklore.jpg";       Title = "Doma y Folklore";               Sub = "Villa Maria - Cordoba";       Accent = @(150, 110, 60) },
  @{ File = "evento-maraton-nocturna.jpg";    Title = "Maraton Nocturna";              Sub = "Circuito Urbano";             Accent = @(60, 110, 180) },
  @{ File = "evento-verbena-barrio.jpg";      Title = "Verbena Popular";               Sub = "Barrio Centro";               Accent = @(190, 100, 90) },
  @{ File = "evento-fin-de-anio.jpg";         Title = "Show de Fin de Anio";           Sub = "Plaza Velez Sarsfield";       Accent = @(120, 80, 170) },
  @{ File = "evento-cuarteto.jpg";            Title = "Fiesta del Cuarteto";           Sub = "Villa Maria - Cordoba";       Accent = @(200, 140, 50) }
)

foreach ($ev in $events) {
  $bmp = New-Object System.Drawing.Bitmap($W, $H)
  $g = [System.Drawing.Graphics]::FromImage($bmp)
  $g.SmoothingMode = 'AntiAlias'
  $g.TextRenderingHint = 'AntiAliasGridFit'

  $a = $ev.Accent
  $bottom = [System.Drawing.Color]::FromArgb([int]($a[0] * 0.45), [int]($a[1] * 0.45), [int]($a[2] * 0.45))

  # Degradado vertical oscuro -> acento.
  $rect = New-Object System.Drawing.Rectangle(0, 0, $W, $H)
  $brush = New-Object System.Drawing.Drawing2D.LinearGradientBrush($rect, $dark, $bottom, 90)
  $g.FillRectangle($brush, $rect)
  $brush.Dispose()

  # Circulos decorativos.
  $c1 = [System.Drawing.Color]::FromArgb([int]($a[0] * 0.55), [int]($a[1] * 0.55), [int]($a[2] * 0.55))
  $b1 = New-Object System.Drawing.SolidBrush($c1)
  $g.FillEllipse($b1, ($W - 320), -120, 440, 440)
  $c2 = [System.Drawing.Color]::FromArgb([int]($a[0] * 0.4), [int]($a[1] * 0.4), [int]($a[2] * 0.4))
  $b2 = New-Object System.Drawing.SolidBrush($c2)
  $g.FillEllipse($b2, -140, ($H - 260), 360, 360)
  $b1.Dispose(); $b2.Dispose()

  # Barra dorada superior.
  $goldBrush = New-Object System.Drawing.SolidBrush($gold)
  $g.FillRectangle($goldBrush, 0, 0, $W, 10)

  $titleFont = New-Object System.Drawing.Font("Arial", 46, [System.Drawing.FontStyle]::Bold)
  $subFont   = New-Object System.Drawing.Font("Arial", 22, [System.Drawing.FontStyle]::Regular)
  $brandFont = New-Object System.Drawing.Font("Arial", 19, [System.Drawing.FontStyle]::Bold)
  $whiteBrush = New-Object System.Drawing.SolidBrush($white)

  # Titulo centrado, en dos lineas si hace falta.
  $fmt = New-Object System.Drawing.StringFormat
  $fmt.Alignment = 'Center'
  $fmt.LineAlignment = 'Center'
  $titleRect = New-Object System.Drawing.RectangleF(80, 200, ($W - 160), 200)
  $g.DrawString($ev.Title, $titleFont, $whiteBrush, $titleRect, $fmt)

  $subRect = New-Object System.Drawing.RectangleF(80, 400, ($W - 160), 60)
  $g.DrawString($ev.Sub, $subFont, $goldBrush, $subRect, $fmt)

  $brandRect = New-Object System.Drawing.RectangleF(80, ($H - 90), ($W - 160), 50)
  $g.DrawString("QUICKFOOD", $brandFont, $goldBrush, $brandRect, $fmt)

  $path = Join-Path $outDir $ev.File
  $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Jpeg)

  $titleFont.Dispose(); $subFont.Dispose(); $brandFont.Dispose()
  $whiteBrush.Dispose(); $goldBrush.Dispose(); $fmt.Dispose()
  $g.Dispose(); $bmp.Dispose()

  $kb = [math]::Round((Get-Item $path).Length / 1KB)
  Write-Output "OK $($ev.File) ($kb KB)"
}
