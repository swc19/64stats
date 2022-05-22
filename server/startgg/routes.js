import express from 'express'
import {router as tournamentRouter} from './tournaments/routes.js'
import {router as eventRouter} from './events/routes.js'
import {router as playerRouter} from './players/routes.js'
import {router as setRouter} from './sets/routes.js'
import {router as standingsRouter} from './standings/routes.js'



export const apiRouter = express.Router()

apiRouter.use(express.json())


apiRouter.use('/tournament', tournamentRouter)
apiRouter.use('/player', playerRouter)
apiRouter.use('/set', setRouter)
apiRouter.use('/standings', standingsRouter)
apiRouter.use('/event', eventRouter)