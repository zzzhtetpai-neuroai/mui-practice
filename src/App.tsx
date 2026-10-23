import { useEffect, useState } from 'react'
import { ThemeProvider, createTheme } from '@mui/material/styles'
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
const CARD_W = 250
const CARD_H = 375
const GOLD = '#c9a227'

// Dark theme with a gold accent
const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: GOLD },
    secondary: { main: '#8e8e93' },
  },
})

// Frosted glass look, reused on panels
const glass = {
  bgcolor: 'rgba(255,255,255,0.05)',
  backgroundImage: 'none',
  backdropFilter: 'blur(12px)',
  border: '1px solid rgba(255,255,255,0.1)',
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

  // Carousel math
  const count = visibleGames.length
  const angle = count > 0 ? 360 / count : 0
  const radius = count <= 1 ? 0 : Math.round(CARD_W / 2 / Math.tan(Math.PI / count)) + 70
  const selectedIndex = count === 0 ? 0 : ((current % count) + count) % count
  const selected = visibleGames[selectedIndex]

  const goTo = (i: number) => {
    if (count === 0) return
    let diff = i - selectedIndex
    if (diff > count / 2) diff -= count
    if (diff < -count / 2) diff += count
    setCurrent(current + diff)
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
    zIndex: 10,
    color: 'white',
    bgcolor: 'rgba(255,255,255,0.08)',
    border: '1px solid rgba(255,255,255,0.15)',
    backdropFilter: 'blur(8px)',
    '&:hover': { bgcolor: 'rgba(255,255,255,0.18)' },
  } as const

  return (
    <ThemeProvider theme={theme}>
      <Box
        sx={{
          minHeight: '100vh',
          color: 'text.primary',
          background: 'radial-gradient(ellipse at top, #3a3a3a 0%, #1c1c1c 45%, #0b0b0b 100%)',
        }}
      >
        <AppBar
          position="sticky"
          elevation={0}
          sx={{
            bgcolor: 'rgba(15,15,15,0.6)',
            backgroundImage: 'none',
            backdropFilter: 'blur(12px)',
            borderBottom: '1px solid rgba(255,255,255,0.08)',
          }}
        >
          <Toolbar>
            <SportsEsportsIcon sx={{ mr: 1, color: GOLD }} />
            <Typography variant="h6" sx={{ flexGrow: 1, letterSpacing: 2 }}>
              ゲーム管理アプリ
            </Typography>
            <Tooltip title="登録ゲーム数">
              <Badge badgeContent={games.length} color="primary">
                <SportsEsportsIcon />
              </Badge>
            </Tooltip>
          </Toolbar>
        </AppBar>

        <div className="max-w-6xl mx-auto p-4">
          {/* Controls */}
          <Paper sx={{ ...glass, p: 2, mb: 3, borderRadius: 3 }}>
            <Stack spacing={2}>
              <TextField
                label="ゲーム名で検索"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                size="small"
                fullWidth
              />
              <Tabs value={tab} onChange={(_e, v: Status) => setTab(v)} variant="fullWidth">
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
                  <Typography variant="caption">最低評価: {minRating}</Typography>
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
                <Typography variant="body2" sx={{ mb: 0.5 }}>
                  クリア率 {clearedCount} / {games.length}
                </Typography>
                <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
              </Box>
            </Stack>
          </Paper>

          {count === 0 && (
            <Alert severity="info" sx={{ mb: 2 }}>
              該当するゲームがありません
            </Alert>
          )}

          {/* 3D carousel */}
          {count > 0 && (
            <Box sx={{ position: 'relative', height: { xs: 380, sm: 470, md: 540 }, overflow: 'hidden' }}>
              {/* Floor shadow */}
              <Box
                sx={{
                  position: 'absolute',
                  left: '50%',
                  bottom: { xs: 30, md: 20 },
                  width: '70%',
                  height: 60,
                  transform: 'translateX(-50%)',
                  background: 'radial-gradient(ellipse, rgba(0,0,0,0.75) 0%, transparent 70%)',
                  filter: 'blur(10px)',
                }}
              />

              <Box
                sx={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  perspective: '1400px',
                  transform: { xs: 'scale(0.62)', sm: 'scale(0.82)', md: 'none' },
                }}
              >
                <Box
                  sx={{
                    position: 'relative',
                    width: CARD_W,
                    height: CARD_H,
                    transformStyle: 'preserve-3d',
                    transform: `translateZ(${-radius}px) rotateY(${-current * angle}deg)`,
                    transition: 'transform 0.7s cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                >
                  {visibleGames.map((game, i) => {
                    const isSelected = i === selectedIndex
                    return (
                      <Card
                        key={game.id}
                        sx={{
                          position: 'absolute',
                          inset: 0,
                          borderRadius: 4,
                          backfaceVisibility: 'hidden',
                          transform: `rotateY(${i * angle}deg) translateZ(${radius}px)`,
                          border: isSelected ? `2px solid ${GOLD}` : '1px solid rgba(255,255,255,0.12)',
                          boxShadow: isSelected
                            ? `0 45px 60px -20px rgba(0,0,0,0.95), 0 0 30px rgba(201,162,39,0.35)`
                            : '0 35px 45px -20px rgba(0,0,0,0.85)',
                          transition: 'box-shadow 0.4s, border 0.4s',
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
                              <Avatar sx={{ width: 80, height: 80, fontSize: 36, bgcolor: GOLD }}>
                                {game.title.charAt(0)}
                              </Avatar>
                            </Box>
                          )}
                          <Box
                            sx={{
                              position: 'absolute',
                              left: 0,
                              right: 0,
                              bottom: 0,
                              p: 2,
                              pt: 6,
                              background: 'linear-gradient(transparent, rgba(0,0,0,0.92))',
                            }}
                          >
                            <Typography variant="h6" sx={{ color: 'white', fontWeight: 'bold', lineHeight: 1.2 }}>
                              {game.title}
                            </Typography>
                            <Rating value={game.rating} readOnly size="small" sx={{ mt: 0.5 }} />
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
            <Typography variant="body2" sx={{ textAlign: 'center', mb: 2, color: 'text.secondary', letterSpacing: 2 }}>
              {selectedIndex + 1} / {count}
            </Typography>
          )}

          {/* Selected game details */}
          {selected && (
            <Paper sx={{ ...glass, p: 2.5, maxWidth: 600, mx: 'auto', mb: 10, borderRadius: 3 }}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ alignItems: { sm: 'center' } }}>
                <Box sx={{ flexGrow: 1 }}>
                  <Typography variant="h5">{selected.title}</Typography>
                  <Chip label={selected.genre} color="primary" size="small" sx={{ mt: 0.5 }} />
                </Box>
                <Rating value={selected.rating} readOnly />
              </Stack>
              <Divider sx={{ my: 1.5 }} />
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
          <Fab color="primary" onClick={openAdd} sx={{ position: 'fixed', bottom: 24, right: 24 }}>
            <AddIcon />
          </Fab>
        </Tooltip>

        <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="xs">
          <DialogTitle>{editingId === null ? 'ゲームを追加' : 'ゲームを編集'}</DialogTitle>
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
                <Typography variant="body2">評価</Typography>
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
            <Button variant="contained" onClick={handleSave} disabled={form.title.trim() === ''}>
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