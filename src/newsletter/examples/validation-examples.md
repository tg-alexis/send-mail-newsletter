# Exemples de validation des emails

## 1. Envoi avec emails invalides

### Requête POST `/newsletter/send`
```json
{
  "recipients": [
    "user@example.com",
    "invalid-email",
    "another@valid.com",
    "badformat@",
    "user@domain",
    "good@test.fr",
    ""
  ]
}
```

### Réponse d'erreur (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "Certains emails ne sont pas valides",
  "error": "Bad Request",
  "invalidRecipients": [
    "invalid-email",
    "badformat@",
    "user@domain",
    ""
  ],
  "totalInvalid": 4,
  "totalProvided": 7,
  "validCount": 3
}
```

## 2. Test d'email unique invalide

### Requête POST `/newsletter/test`
```json
{
  "email": "email-invalide"
}
```

### Réponse d'erreur (400 Bad Request)
```json
{
  "statusCode": 400,
  "message": "L'email fourni n'est pas valide",
  "error": "Bad Request",
  "invalidEmail": "email-invalide",
  "reason": "Format email invalide"
}
```

## 3. Envoi réussi (tous les emails sont valides)

### Requête POST `/newsletter/send`
```json
{
  "recipients": [
    "user1@example.com",
    "user2@test.fr",
    "admin@company.org"
  ]
}
```

### Réponse de succès (200 OK)
```json
{
  "message": "Newsletter envoyée",
  "totalRecipients": 3,
  "successCount": 3,
  "failureCount": 0,
  "success": [
    "user1@example.com",
    "user2@test.fr",
    "admin@company.org"
  ],
  "failed": []
}
```

## Types d'emails détectés comme invalides

- ❌ `invalid-email` (pas de @)
- ❌ `badformat@` (pas de domaine)
- ❌ `user@domain` (pas d'extension)
- ❌ `@domain.com` (pas de partie locale)
- ❌ `user@.com` (domaine vide)
- ❌ `""` (email vide)
- ❌ `null` ou `undefined`
- ✅ `user@example.com` (format valide)
- ✅ `test.email+tag@domain.co.uk` (format complexe valide) 