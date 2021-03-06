import React, { Component } from 'react'
import axios from 'axios'

class Fib extends Component {
  state = {
    seenIndexes: [],
    values: null,
    index: '',
  }

  componentDidMount() {
    this.fetchValues()
    this.fetchIndexes()
  }

  fetchValues = async () => {
    const values = await axios.get('/api/values/current')
    console.log('values :>> ', values)
    this.setState({ values: values.data })
  }

  fetchIndexes = async () => {
    const seenIndexes = await axios.get('/api/values/all')
    this.setState({ seenIndexes: seenIndexes.data })
  }

  handleSubmit = async event => {
    event.preventDefault()
    const result = await axios.post('/api/value', {
      index: this.state.index,
    })
    console.log('result :>> ', result.data)
    this.setState({ index: '' })

    this.fetchValues()
    this.fetchIndexes()
    this.renderSeenIndexes()
    this.renderValues()
  }

  renderSeenIndexes = () => {
    if (!this.state.seenIndexes.length) {
      return
    }
    return this.state.seenIndexes.map(({ number }) => number).join(', ')
  }

  renderValues = () => {
    if (!this.state.values) {
      return
    }
    const entries = Object.entries(this.state.values)
    return entries.map(entry => (
      <div key={entry}>
        For index {entry[0]} I calculated {entry[1]}
      </div>
    ))
  }

  render() {
    return (
      <div>
        <form onSubmit={this.handleSubmit}>
          <label htmlFor="index">Enter your index</label>
          <input
            onChange={event => this.setState({ index: event.target.value })}
            type="text"
            value={this.state.index}
          />
          <button>Submit</button>
        </form>
        <h3>Indexes i have seen</h3>
        {this.renderSeenIndexes()}

        <h3>Calculated values</h3>
        {this.renderValues()}
      </div>
    )
  }
}

export default Fib
