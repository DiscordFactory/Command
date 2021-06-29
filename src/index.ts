#! /usr/bin/env node
// import Dispatcher from './Dispatcher'
import CommandManager from "./CommandManager";

const [, , commandName] = process.argv
// const dispatcher: Dispatcher = new Dispatcher()
//
// dispatcher.dispatch(commandName).catch()

CommandManager.getInstance().dispatch(commandName)