import { useEffect, useState } from 'react'
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles'
import AppBar from '@mui/material/AppBar'
import Toolbar from '@mui/material/Toolbar'
import Typography from '@mui/material/Typography'
import Badge from '@mui/material/Badge'
import Box from '@mui/material/Box'
import Stack from '@mui/material/Stack'
import Paper from '@mui/material/Paper'
import TextField from '@mui/material/TextField'
import Tabs from '@mui/material/Tabs'
import Tab from '@mui/material/Tab'
import ToggleButtonGroup from '@mui/material/ToggleButtonGroup'
import ToggleButton from '@mui/material/ToggleButton'
import Switch from '@mui/material/Switch'
import FormControlLabel from '@mui/material/FormControlLabel'
import Slider from '@mui/material/Slider'
import LinearProgress from '@mui/material/LinearProgress'
import Card from '@mui/material/Card'
import CardActionArea from '@mui/material/CardActionArea'
import CardMedia from '@mui/material/CardMedia'
import Avatar from '@mui/material/Avatar'
import Chip from '@mui/material/Chip'
import Rating from '@mui/material/Rating'
import Checkbox from '@mui/material/Checkbox'
import IconButton from '@mui/material/IconButton'
import Tooltip from '@mui/material/Tooltip'
import Divider from '@mui/material/Divider'
import Fab from '@mui/material/Fab'
import Dialog from '@mui/material/Dialog'
import DialogTitle from '@mui/material/DialogTitle'
import DialogContent from '@mui/material/DialogContent'
import DialogActions from '@mui/material/DialogActions'
import Button from '@mui/material/Button'
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import Select from '@mui/material/Select'
import MenuItem from '@mui/material/MenuItem'
import Snackbar from '@mui/material/Snackbar'
import Alert from '@mui/material/Alert'
import AddIcon from '@mui/icons-material/Add'
import EditIcon from '@mui/icons-material/Edit'
import DeleteIcon from '@mui/icons-material/Delete'
import FavoriteIcon from '@mui/icons-material/Favorite'
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew'
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'

type Status = 'all' | 'playing' | 'cleared'
type SortKey = 'rating' | 'title'

type Game = {
  id: number
  title: string
  genre: string
  rating: number
  cleared: boolean
  favorite: boolean
  image: string
}

type GameForm = Omit<Game, 'id'>

const STORAGE_KEY = 'games-v2'

// Card size and cover-flow settings
const CARD_W = 280
const CARD_H = 420
const SPACING = 170 // horizontal distance between cards (smaller = more overlap)
const DEPTH = 140 // how far side cards go back
const ROTATE = 40 // how much side cards turn
const VISIBLE_SIDE = 2 // cards shown on each side

// Colors
const GOLD = '#c9a227'
const GOLD_GRADIENT = 'linear-gradient(135deg, #f7e8a4 0%, #d4af37 40%, #a67c1b 75%, #f1d88a 100%)'
const DARK_TEXT = '#1a1a1a'

// Typography: Cinzel for titles (English), Shippori Mincho for Japanese titles, Noto Sans JP for body
const HEADING_FONT = '"Cinzel", "Shippori Mincho", serif'
const BODY_FONT = '"Noto Sans JP", "Helvetica", "Arial", sans-serif'

const theme = responsiveFontSizes(
  createTheme({
    palette: {
      mode: 'dark',
      primary: { main: GOLD, contrastText: DARK_TEXT },
      secondary: { main: '#8e8e93' },
      background: { default: '#0b0b0b', paper: '#161616' },
    },
    typography: {
      fontFamily: BODY_FONT,
      h1: { fontFamily: HEADING_FONT, fontWeight: 700, letterSpacing: '0.04em' },
      h2: { fontFamily: HEADING_FONT, fontWeight: 700, letterSpacing: '0.04em' },
      h3: { fontFamily: HEADING_FONT, fontWeight: 700, letterSpacing: '0.04em' },
      h4: { fontFamily: HEADING_FONT, fontWeight: 700, letterSpacing: '0.05em' },
      h5: { fontFamily: HEADING_FONT, fontWeight: 700, letterSpacing: '0.05em' },
      h6: { fontFamily: HEADING_FONT, fontWeight: 700, letterSpacing: '0.06em' },
      subtitle1: { fontFamily: HEADING_FONT, fontWeight: 500, letterSpacing: '0.05em' },
      body1: { fontWeight: 400 },
      body2: { fontWeight: 400, letterSpacing: '0.02em' },
      button: { fontWeight: 700, letterSpacing: '0.08em' },
      caption: { letterSpacing: '0.06em' },
    },
    shape: { borderRadius: 12 },
  }),
)

// Frosted glass panels
const glass = {
  bgcolor: 'rgba(255,255,255,0.05)',
  backgroundImage: 'none',
  backdropFilter: 'blur(14px)',
  border: '1px solid rgba(255,255,255,0.1)',
  boxShadow: '0 20px 40px -20px rgba(0,0,0,0.8)',
}

// Gold gradient text
const goldText = {
  backgroundImage: GOLD_GRADIENT,
  WebkitBackgroundClip: 'text',
  backgroundClip: 'text',
  color: 'transparent',
}

const genres = ['アクション', 'オープンワールド', 'レース', 'RPG', 'パズル', 'シューティング', '格闘', 'スポーツ', 'その他']

const sampleGames: Game[] = [
  { id: 1, title: 'GTA VI', genre: 'オープンワールド', rating: 5, cleared: false, favorite: true, image: 'gta6.jpg' },
  { id: 2, title: 'Ghost of Tsushima', genre: 'アクション', rating: 5, cleared: true, favorite: true, image: 'ghost-of-tsushima.jpg' },
  { id: 3, title: 'God of War', genre: 'アクション', rating: 5, cleared: true, favorite: false, image: 'god-of-war.jpg' },
  { id: 4, title: "Assassin's Creed Shadows", genre: 'アクション', rating: 4, cleared: false, favorite: false, image: 'ac-shadows.jpg' },
  { id: 5, title: 'Need for Speed Rivals', genre: 'レース', rating: 4, cleared: true, favorite: false, image: 'nfs-rivals.jpg' },
  { id: 6, title: 'Red Dead Redemption 2', genre: 'オープンワールド', rating: 5, cleared: true, favorite: true, image: 'rdr2.jpg' },
]

const emptyForm: GameForm = { title: '', genre: 'アクション', rating: 3, cleared: false, favorite: false, image: '' }

function loadGames(): Game[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY)
    return saved ? JSON.parse(saved) : sampleGames
  } catch {
    return sampleGames
  }
}

function imageSrc(image: string) {
  return image.startsWith('http') ? image : `${import.meta.env.BASE_URL}images/${image}`
}

function App() {
  const [games, setGames] = useState<Game[]>(loadGames)
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState<Status>('all')
  const [sortKey, setSortKey] = useState<SortKey>('rating')
  const [favoriteOnly, setFavoriteOnly] = useState(false)
  const [minRating, setMinRating] = useState(0)
  const [current, setCurrent] = useState(0)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingId, setEditingId] = useState<number | null>(null)
  const [form, setForm] = useState<GameForm>(emptyForm)
  const [message, setMessage] = useState('')

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(games))
    } catch {
      // ignore
    }
  }, [games])

  const clearedCount = games.filter((g) => g.cleared).length
  const progress = games.length === 0 ? 0 : (clearedCount / games.length) * 100

  const visibleGames = games
    .filter((g) => g.title.toLowerCase().includes(search.toLowerCase()))
    .filter((g) => tab === 'all' || (tab === 'cleared' ? g.cleared : !g.cleared))
    .filter((g) => !favoriteOnly || g.favorite)
    .filter((g) => g.rating >= minRating)
    .sort((a, b) => (sortKey === 'rating' ? b.rating - a.rating : a.title.localeCompare(b.title)))

  // Cover-flow math: each card's position relative to the selected one (wraps around like a circle)
  const count = visibleGames.length
  const selectedIndex = count === 0 ? 0 : ((current % count) + count) % count
  const selected = visibleGames[selectedIndex]

  const offsetOf = (i: number) => {
    let d = i - selectedIndex
    if (d > count / 2) d -= count
    if (d < -count / 2) d += count
    return d
  }

  const goTo = (i: number) => {
    if (count === 0) return
    setCurrent(current + offsetOf(i))
  }

  const openAdd = () => {
    setEditingId(null)
    setForm(emptyForm)
    setDialogOpen(true)
  }

  const openEdit = (game: Game) => {
    setEditingId(game.id)
    setForm({
      title: game.title,
      genre: game.genre,
      rating: game.rating,
      cleared: game.cleared,
      favorite: game.favorite,
      image: game.image,
    })
    setDialogOpen(true)
  }

  const handleSave = () => {
    if (form.title.trim() === '') return
    if (editingId === null) {
      const newId = games.length === 0 ? 1 : Math.max(...games.map((g) => g.id)) + 1
      setGames([...games, { id: newId, ...form }])
      setMessage(`${form.title} を追加しました`)
    } else {
      setGames(games.map((g) => (g.id === editingId ? { id: editingId, ...form } : g)))
      setMessage(`${form.title} を更新しました`)
    }
    setDialogOpen(false)
  }

  const handleDelete = (game: Game) => {
    setGames(games.filter((g) => g.id !== game.id))
    setMessage(`${game.title} を削除しました`)
  }

  const toggleCleared = (id: number) => {
    setGames(games.map((g) => (g.id === id ? { ...g, cleared: !g.cleared } : g)))
  }

  const toggleFavorite = (id: number) => {
    setGames(games.map((g) => (g.id === id ? { ...g, favorite: !g.favorite } : g)))
  }

  const arrowStyle = {
    position: 'absolute',
    top: '50%',
    transform: 'translateY(-50%)',
    zIndex: 200,
    color: 'white',
    bgcolor: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.18)',
    backdropFilter: 'blur(10px)',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' },
  } as const

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          color: 'text.primary',
          fontFamily: BODY_FONT,
          background: 'radial-gradient(ellipse at 50% 0%, #3d3a33 0%, #1b1b1b 45%, #0a0a0a 100%)',
        }}
      >
        {/* Header */}
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'rgba(12,12,12,0.6)',
            backgroundImage: 'none',
            backdropFilter: 'blur(14px)',
            borderBottom: '1px solid rgba(201,162,39,0.25)',
          }}
        >
          <Toolbar>
            <SportsEsportsIcon sx={{ mr: 1.5, color: GOLD }} />
            <Typography variant="h6" sx={{ flexGrow: 1, ...goldText }}>
              ゲーム管理アプリ
            </Typography>
            <Tooltip title="登録ゲーム数">
              <Badge badgeContent={games.length} color="primary">
                <SportsEsportsIcon />
              </Badge>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <div className="max-w-6xl mx-auto px-4 py-6">
          {/* Page heading */}
          <Typography variant="h4" sx={{ textAlign: 'center', mb: 0.5, ...goldText }}>
            Game Collection
          </Typography>
          <Typography variant="body2" sx={{ textAlign: 'center', color: 'text.secondary', mb: 3 }}>
            お気に入りのゲームを管理しよう
          </Typography>

          {/* Controls */}
          <Paper sx={{ ...glass, p: 2.5, mb: 3, borderRadius: 4 }}>
            <Stack spacing={2}>
              <TextField
                label="ゲーム名で検索"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                fullWidth
              />
              <Tabs
                value={tab}
                onChange={(_e, v: Status) => setTab(v)}
                variant="fullWidth"
                sx={{ '& .MuiTabs-indicator': { backgroundImage: GOLD_GRADIENT, height: 3 } }}
              >
                <Tab label="すべて" value="all" />
                <Tab label="プレイ中" value="playing" />
                <Tab label="クリア済み" value="cleared" />
              </Tabs>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'center' } }}>
                <ToggleButtonGroup
                  value={sortKey}
                  exclusive
                  size="small"
                  onChange={(_e, v: SortKey | null) => {
                    if (v) setSortKey(v)
                  }}
                >
                  <ToggleButton value="rating">評価順</ToggleButton>
                  <ToggleButton value="title">名前順</ToggleButton>
                </ToggleButtonGroup>
                <FormControlLabel
                  control={<Switch checked={favoriteOnly} onChange={(e) => setFavoriteOnly(e.target.checked)} />}
                  label="お気に入りのみ"
                />
                <Box sx={{ flexGrow: 1, px: 1 }}>
                  <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                    最低評価: {minRating}
                  </Typography>
                  <Slider
                    value={minRating}
                    onChange={(_e, v) => setMinRating(v as number)}
                    min={0}
                    max={5}
                    step={1}
                    marks
                    size="small"
                  />
                </Box>
              </Stack>
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  クリア率 {clearedCount} / {games.length}
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  sx={{
                    mt: 0.5,
                    height: 8,
                    borderRadius: 4,
                    bgcolor: 'rgba(255,255,255,0.08)',
                    '& .MuiLinearProgress-bar': { backgroundImage: GOLD_GRADIENT, borderRadius: 4 },
                  }}
                />
              </Box>
            </Stack>
          </Paper>

          {count === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              該当するゲームがありません
            </Alert>
          )}

          {/* Cover-flow carousel */}
          {count > 0 && (
            <Box sx={{ position: 'relative', height: { xs: 420, sm: 540, md: 620 }, overflow: 'hidden' }}>
              {/* Floor shadow */}
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  bottom: { xs: 40, md: 40 },
                  width: '75%',
                  height: 70,
                  transform: 'translateX(-50%)',
                  background: 'radial-gradient(ellipse, rgba(0,0,0,0.8) 0%, transparent 70%)',
                  filter: 'blur(12px)',
                }}
              />

              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  perspective: '1200px',
                  transform: { xs: 'scale(0.6)', sm: 'scale(0.8)', md: 'none' },
                }}
              >
                <Box sx={{ position: 'relative', width: CARD_W, height: CARD_H, transformStyle: 'preserve-3d' }}>
                  {visibleGames.map((game, i) => {
                    const offset = offsetOf(i)
                    const abs = Math.abs(offset)
                    const isSelected = offset === 0
                    const visible = abs <= VISIBLE_SIDE
                    const turn = offset === 0 ? 0 : offset > 0 ? -ROTATE : ROTATE

                    return (
                      <Card
                        key={game.id}
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: 4,
                          overflow: 'hidden',
                          transform: `translateX(${offset * SPACING}px) translateZ(${-abs * DEPTH}px) rotateY(${turn}deg)`,
                          zIndex: 100 - abs,
                          opacity: visible ? 1 : 0,
                          pointerEvents: visible ? 'auto' : 'none',
                          filter: isSelected ? 'none' : 'brightness(0.65)',
                          transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.5s, filter 0.5s',
                          border: isSelected ? '2px solid transparent' : '1px solid rgba(255,255,255,0.18)',
                          background: isSelected
                            ? `linear-gradient(#111, #111) padding-box, ${GOLD_GRADIENT} border-box`
                            : '#111',
                          boxShadow: isSelected
                            ? '0 50px 70px -25px rgba(0,0,0,0.95), 0 0 40px rgba(212,175,55,0.35)'
                            : '0 40px 50px -25px rgba(0,0,0,0.9)',
                          WebkitBoxReflect: 'below 10px linear-gradient(transparent 75%, rgba(255,255,255,0.18))',
                        }}
                      >
                        <CardActionArea onClick={() => goTo(i)} sx={{ height: '100%', position: 'relative' }}>
                          {game.image ? (
                            <CardMedia
                              component="img"
                              image={imageSrc(game.image)}
                              alt={game.title}
                              sx={{ height: '100%', objectFit: 'cover' }}
                            />
                          ) : (
                            <Box
                              sx={{
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                background: 'linear-gradient(135deg, #2c2c2e, #0b0b0b)',
                              }}
                            >
                              <Avatar sx={{ width: 90, height: 90, fontSize: 40, backgroundImage: GOLD_GRADIENT, color: DARK_TEXT }}>
                                {game.title.charAt(0)}
                              </Avatar>
                            </Box>
                          )}

                          {/* Glass shine */}
                          <Box
                            sx={{
                              position: 'absolute',
                              inset: 0,
                              pointerEvents: 'none',
                              background:
                                'linear-gradient(125deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 28%, transparent 55%)',
                            }}
                          />

                          {/* Title and stars */}
                          <Box
                            sx={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              bottom: 0,
                              p: 2.5,
                              pt: 8,
                              background: 'linear-gradient(transparent, rgba(0,0,0,0.92))',
                            }}
                          >
                            <Typography variant="h6" sx={{ color: 'white', lineHeight: 1.25 }}>
                              {game.title}
                            </Typography>
                            <Rating value={game.rating} readOnly size="small" sx={{ mt: 0.75 }} />
                          </Box>
                        </CardActionArea>
                      </Card>
                    )
                  })}
                </Box>
              </Box>

              <IconButton onClick={() => setCurrent(current - 1)} sx={{ ...arrowStyle, left: 8 }}>
                <ArrowBackIosNewIcon />
              </IconButton>
              <IconButton onClick={() => setCurrent(current + 1)} sx={{ ...arrowStyle, right: 8 }}>
                <ArrowForwardIosIcon />
              </IconButton>
            </Box>
          )}

          {count > 0 && (
            <Typography variant="caption" component="p" sx={{ textAlign: 'center', mb: 3, color: 'text.secondary', letterSpacing: '0.3em' }}>
              {selectedIndex + 1} / {count}
            </Typography>
          )}

          {/* Selected game details */}
          {selected && (
            <Paper sx={{ ...glass, p: 3, maxWidth: 640, mx: 'auto', mb: 12, borderRadius: 4 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} sx={{ alignItems: { sm: 'center' } }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5">{selected.title}</Typography>
                  <Chip
                    label={selected.genre}
                    size="small"
                    sx={{ mt: 1, backgroundImage: GOLD_GRADIENT, color: DARK_TEXT, fontWeight: 700 }}
                  />
                </Box>
                <Rating value={selected.rating} readOnly />
              </Stack>
              <Divider sx={{ my: 2, borderColor: 'rgba(201,162,39,0.25)' }} />
              <Stack direction="row" sx={{ alignItems: 'center' }}>
                <FormControlLabel
                  control={<Checkbox checked={selected.cleared} onChange={() => toggleCleared(selected.id)} />}
                  label="クリア"
                />
                <Box sx={{ flexGrow: 1 }} />
                <Tooltip title="お気に入り">
                  <IconButton color="error" onClick={() => toggleFavorite(selected.id)}>
                    {selected.favorite ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                </Tooltip>
                <Tooltip title="編集">
                  <IconButton onClick={() => openEdit(selected)}>
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                <Tooltip title="削除">
                  <IconButton onClick={() => handleDelete(selected)}>
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Stack>
            </Paper>
          )}
        </div>

        <Tooltip title="ゲームを追加">
          <Fab
            onClick={openAdd}
            sx={{
              position: 'fixed',
              bottom: 24,
              right: 24,
              backgroundImage: GOLD_GRADIENT,
              color: DARK_TEXT,
              boxShadow: '0 10px 30px rgba(212,175,55,0.35)',
            }}
          >
            <AddIcon />
          </Fab>
        </Tooltip>

        <Dialog
          open={dialogOpen}
          onClose={() => setDialogOpen(false)}
          fullWidth
          maxWidth="xs"
          slotProps={{ paper: { sx: { ...glass, bgcolor: 'rgba(22,22,22,0.85)', borderRadius: 4 } } }}
        >
          <DialogTitle sx={goldText}>{editingId === null ? 'ゲームを追加' : 'ゲームを編集'}</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ mt: 1 }}>
              <TextField
                label="ゲーム名"
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                autoFocus
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel id="genre-label">ジャンル</InputLabel>
                <Select
                  labelId="genre-label"
                  label="ジャンル"
                  value={form.genre}
                  onChange={(e) => setForm({ ...form, genre: e.target.value })}
                >
                  {genres.map((g) => (
                    <MenuItem key={g} value={g}>
                      {g}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <TextField
                label="画像ファイル名 または URL"
                helperText="例: gta6.jpg (public/images に置く)"
                value={form.image}
                onChange={(e) => setForm({ ...form, image: e.target.value })}
                fullWidth
              />
              <Box>
                <Typography variant="caption" sx={{ color: 'text.secondary' }}>
                  評価
                </Typography>
                <Rating value={form.rating} onChange={(_e, v) => setForm({ ...form, rating: v ?? 0 })} />
              </Box>
              <FormControlLabel
                control={<Checkbox checked={form.cleared} onChange={(e) => setForm({ ...form, cleared: e.target.checked })} />}
                label="クリア済み"
              />
              <FormControlLabel
                control={<Switch checked={form.favorite} onChange={(e) => setForm({ ...form, favorite: e.target.checked })} />}
                label="お気に入り"
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDialogOpen(false)}>キャンセル</Button>
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={form.title.trim() === ''}
              sx={{ backgroundImage: GOLD_GRADIENT, color: DARK_TEXT }}
            >
              保存
            </Button>
          </DialogActions>
        </Dialog>

        <Snackbar
          open={message !== ''}
          autoHideDuration={2500}
          onClose={() => setMessage('')}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
        >
          <Alert severity="success" variant="filled" onClose={() => setMessage('')}>
            {message}
          </Alert>
        </Snackbar>
      </Box>
    </ThemeProvider>
  )
}

export default App