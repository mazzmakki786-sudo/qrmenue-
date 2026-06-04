param(
    [Parameter(Mandatory=$true)]
    [string]$SupabaseToken,
    
    [Parameter(Mandatory=$true)]
    [string]$ProjectRef = "zkwwqcopkwbzbsqqxoiq"
)

$headers = @{ Authorization = "Bearer $SupabaseToken" }
$url = "https://api.supabase.com/v1/projects/$ProjectRef/database/query"

$sql = [System.IO.File]::ReadAllText((Resolve-Path "supabase_migration.sql"))

# Split by blank lines followed by comments (section headers)
$sections = $sql -split '(?=^-- ============================================)', 'Multiline', 'Regex'

$i = 0
foreach ($section in $sections) {
    $trimmed = $section.Trim()
    if ($trimmed.Length -eq 0) { continue }
    $i++
    $firstLine = ($trimmed -split "`n")[0]
    Write-Output "=== Running section $i: $firstLine ==="
    $body = @{ query = $trimmed } | ConvertTo-Json -Compress
    try {
        Invoke-RestMethod -Uri $url -Method Post -Headers $headers -ContentType "application/json" -Body $body
        Write-Output "  -> OK"
    } catch {
        Write-Output "  -> FAILED: $_"
        if ($_.Exception.Response) {
            $reader = [System.IO.StreamReader]::new($_.Exception.Response.GetResponseStream())
            $detail = $reader.ReadToEnd()
            Write-Output "  -> DETAILS: $detail"
            $reader.Close()
        }
    }
}
Write-Output "Done. Ran $i sections."
