#! /usr/bin/env node
import Dispatcher from './Dispatcher'

const [, , commandName] = process.argv
const dispatcher: Dispatcher = new Dispatcher()

dispatcher.dispatch(commandName).catch()
