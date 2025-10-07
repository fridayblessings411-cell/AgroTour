(define-constant ERR-NOT-AUTHORIZED u100)
(define-constant ERR-INVALID-NAME u101)
(define-constant ERR-INVALID-LOCATION u102)
(define-constant ERR-INVALID-SIZE u103)
(define-constant ERR-INVALID-CROP-TYPES u104)
(define-constant ERR-INVALID-CERTIFICATIONS u105)
(define-constant ERR-FARM-ALREADY-EXISTS u106)
(define-constant ERR-FARM-NOT-FOUND u107)
(define-constant ERR-INVALID-TIMESTAMP u108)
(define-constant ERR-AUTHORITY-NOT-VERIFIED u109)
(define-constant ERR-INVALID-SUSTAINABILITY u110)
(define-constant ERR-INVALID-OWNER u111)
(define-constant ERR-FARM-UPDATE-NOT-ALLOWED u112)
(define-constant ERR-INVALID-UPDATE-PARAM u113)
(define-constant ERR-MAX-FARMS-EXCEEDED u114)
(define-constant ERR-INVALID-FARM-TYPE u115)
(define-constant ERR-INVALID-CAPACITY u116)
(define-constant ERR-INVALID-CLIMATE u117)
(define-constant ERR-INVALID-SOIL u118)
(define-constant ERR-INVALID-CURRENCY u119)
(define-constant ERR-INVALID-STATUS u120)

(define-data-var next-farm-id uint u0)
(define-data-var max-farms uint u1000)
(define-data-var registration-fee uint u1000)
(define-data-var authority-contract (optional principal) none)

(define-map farms
  uint
  {
    name: (string-utf8 100),
    location: (string-utf8 100),
    size: uint,
    crop-types: (string-utf8 200),
    certifications: (string-utf8 200),
    timestamp: uint,
    owner: principal,
    farm-type: (string-utf8 50),
    capacity: uint,
    climate: (string-utf8 50),
    soil: (string-utf8 50),
    currency: (string-utf8 20),
    status: bool,
    sustainability-score: uint,
    max-investors: uint
  }
)

(define-map farms-by-name
  (string-utf8 100)
  uint)

(define-map farm-updates
  uint
  {
    update-name: (string-utf8 100),
    update-location: (string-utf8 100),
    update-size: uint,
    update-timestamp: uint,
    updater: principal
  }
)

(define-read-only (get-farm (id uint))
  (map-get? farms id)
)

(define-read-only (get-farm-updates (id uint))
  (map-get? farm-updates id)
)

(define-read-only (is-farm-registered (name (string-utf8 100)))
  (is-some (map-get? farms-by-name name))
)

(define-private (validate-name (name (string-utf8 100)))
  (if (and (> (len name) u0) (<= (len name) u100))
      (ok true)
      (err ERR-INVALID-NAME))
)

(define-private (validate-location (loc (string-utf8 100)))
  (if (and (> (len loc) u0) (<= (len loc) u100))
      (ok true)
      (err ERR-INVALID-LOCATION))
)

(define-private (validate-size (size uint))
  (if (> size u0)
      (ok true)
      (err ERR-INVALID-SIZE))
)

(define-private (validate-crop-types (crops (string-utf8 200)))
  (if (> (len crops) u0)
      (ok true)
      (err ERR-INVALID-CROP-TYPES))
)

(define-private (validate-certifications (certs (string-utf8 200)))
  (if (>= (len certs) u0)
      (ok true)
      (err ERR-INVALID-CERTIFICATIONS))
)

(define-private (validate-timestamp (ts uint))
  (if (>= ts block-height)
      (ok true)
      (err ERR-INVALID-TIMESTAMP))
)

(define-private (validate-farm-type (type (string-utf8 50)))
  (if (or (is-eq type "organic") (is-eq type "conventional") (is-eq type "hydroponic"))
      (ok true)
      (err ERR-INVALID-FARM-TYPE))
)

(define-private (validate-capacity (cap uint))
  (if (> cap u0)
      (ok true)
      (err ERR-INVALID-CAPACITY))
)

(define-private (validate-climate (clim (string-utf8 50)))
  (if (> (len clim) u0)
      (ok true)
      (err ERR-INVALID-CLIMATE))
)

(define-private (validate-soil (soil (string-utf8 50)))
  (if (> (len soil) u0)
      (ok true)
      (err ERR-INVALID-SOIL))
)

(define-private (validate-currency (cur (string-utf8 20)))
  (if (or (is-eq cur "STX") (is-eq cur "USD") (is-eq cur "BTC"))
      (ok true)
      (err ERR-INVALID-CURRENCY))
)

(define-private (validate-sustainability-score (score uint))
  (if (<= score u100)
      (ok true)
      (err ERR-INVALID-SUSTAINABILITY))
)

(define-private (validate-max-investors (max uint))
  (if (> max u0)
      (ok true)
      (err ERR-INVALID-OWNER))
)

(define-private (validate-principal (p principal))
  (if (not (is-eq p 'SP000000000000000000002Q6VF78))
      (ok true)
      (err ERR-NOT-AUTHORIZED))
)

(define-public (set-authority-contract (contract-principal principal))
  (begin
    (try! (validate-principal contract-principal))
    (asserts! (is-none (var-get authority-contract)) (err ERR-AUTHORITY-NOT-VERIFIED))
    (var-set authority-contract (some contract-principal))
    (ok true)
  )
)

(define-public (set-max-farms (new-max uint))
  (begin
    (asserts! (> new-max u0) (err ERR-MAX-FARMS-EXCEEDED))
    (asserts! (is-some (var-get authority-contract)) (err ERR-AUTHORITY-NOT-VERIFIED))
    (var-set max-farms new-max)
    (ok true)
  )
)

(define-public (set-registration-fee (new-fee uint))
  (begin
    (asserts! (>= new-fee u0) (err ERR-INVALID-UPDATE-PARAM))
    (asserts! (is-some (var-get authority-contract)) (err ERR-AUTHORITY-NOT-VERIFIED))
    (var-set registration-fee new-fee)
    (ok true)
  )
)

(define-public (create-farm
  (farm-name (string-utf8 100))
  (location (string-utf8 100))
  (size uint)
  (crop-types (string-utf8 200))
  (certifications (string-utf8 200))
  (farm-type (string-utf8 50))
  (capacity uint)
  (climate (string-utf8 50))
  (soil (string-utf8 50))
  (currency (string-utf8 20))
  (sustainability-score uint)
  (max-investors uint)
)
  (let (
        (next-id (var-get next-farm-id))
        (current-max (var-get max-farms))
        (authority (var-get authority-contract))
      )
    (asserts! (< next-id current-max) (err ERR-MAX-FARMS-EXCEEDED))
    (try! (validate-name farm-name))
    (try! (validate-location location))
    (try! (validate-size size))
    (try! (validate-crop-types crop-types))
    (try! (validate-certifications certifications))
    (try! (validate-farm-type farm-type))
    (try! (validate-capacity capacity))
    (try! (validate-climate climate))
    (try! (validate-soil soil))
    (try! (validate-currency currency))
    (try! (validate-sustainability-score sustainability-score))
    (try! (validate-max-investors max-investors))
    (asserts! (is-none (map-get? farms-by-name farm-name)) (err ERR-FARM-ALREADY-EXISTS))
    (let ((authority-recipient (unwrap! authority (err ERR-AUTHORITY-NOT-VERIFIED))))
      (try! (stx-transfer? (var-get registration-fee) tx-sender authority-recipient))
    )
    (map-set farms next-id
      {
        name: farm-name,
        location: location,
        size: size,
        crop-types: crop-types,
        certifications: certifications,
        timestamp: block-height,
        owner: tx-sender,
        farm-type: farm-type,
        capacity: capacity,
        climate: climate,
        soil: soil,
        currency: currency,
        status: true,
        sustainability-score: sustainability-score,
        max-investors: max-investors
      }
    )
    (map-set farms-by-name farm-name next-id)
    (var-set next-farm-id (+ next-id u1))
    (print { event: "farm-created", id: next-id })
    (ok next-id)
  )
)

(define-public (update-farm
  (farm-id uint)
  (update-name (string-utf8 100))
  (update-location (string-utf8 100))
  (update-size uint)
)
  (let ((farm (map-get? farms farm-id)))
    (match farm
      f
        (begin
          (asserts! (is-eq (get owner f) tx-sender) (err ERR-NOT-AUTHORIZED))
          (try! (validate-name update-name))
          (try! (validate-location update-location))
          (try! (validate-size update-size))
          (let ((existing (map-get? farms-by-name update-name)))
            (match existing
              existing-id
                (asserts! (is-eq existing-id farm-id) (err ERR-FARM-ALREADY-EXISTS))
              (begin true)
            )
          )
          (let ((old-name (get name f)))
            (if (is-eq old-name update-name)
                (ok true)
                (begin
                  (map-delete farms-by-name old-name)
                  (map-set farms-by-name update-name farm-id)
                  (ok true)
                )
            )
          )
          (map-set farms farm-id
            {
              name: update-name,
              location: update-location,
              size: update-size,
              crop-types: (get crop-types f),
              certifications: (get certifications f),
              timestamp: block-height,
              owner: (get owner f),
              farm-type: (get farm-type f),
              capacity: (get capacity f),
              climate: (get climate f),
              soil: (get soil f),
              currency: (get currency f),
              status: (get status f),
              sustainability-score: (get sustainability-score f),
              max-investors: (get max-investors f)
            }
          )
          (map-set farm-updates farm-id
            {
              update-name: update-name,
              update-location: update-location,
              update-size: update-size,
              update-timestamp: block-height,
              updater: tx-sender
            }
          )
          (print { event: "farm-updated", id: farm-id })
          (ok true)
        )
      (err ERR-FARM-NOT-FOUND)
    )
  )
)

(define-public (get-farm-count)
  (ok (var-get next-farm-id))
)

(define-public (check-farm-existence (name (string-utf8 100)))
  (ok (is-farm-registered name))
)