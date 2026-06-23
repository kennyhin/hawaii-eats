# Tennis Court Skins

Drop court background images here, then add an entry for each one in
`SHOP_TENNIS_COURTS` in `app.js` (look for the existing color entries —
just add `image: 'tennis-courts/your-file.png'` to a new object in that
array, same as the cosmetic skins in `/skins/`).

- Recommended size/aspect ratio: 600×360 (matches the game canvas) — wider
  images will get stretched to fit.
- PNG or JPG both work.
- Keep filenames lowercase with underscores, e.g. `clay_court.png`.
- Add `overlay: 0` to the entry (default is 0.4, a white wash) so the
  court thumbnail and in-game texture aren't washed out.
