import dateFormat from 'dateformat'
import { History } from 'history'
import update from 'immutability-helper'
import * as React from 'react'
import {
  Button,
  Checkbox,
  Divider,
  Grid,
  Header,
  Icon,
  Image,
  Loader,
  Form
} from 'semantic-ui-react'

import { createBook, deleteBook, getBooks, patchBook } from '../api/books-api'
import Auth from '../auth/Auth'
import { Book } from '../types/Book'

interface BooksProps {
  auth: Auth
  history: History
}

interface BooksState {
  books: Book[]
  newBookName: string
  newBookAuthor: string
  newBookPrice: string
  loadingBooks: boolean
}

export class Books extends React.PureComponent<BooksProps, BooksState> {
  state: BooksState = {
    books: [],
    newBookName: '',
    newBookAuthor: '',
    newBookPrice: '0$',
    loadingBooks: true
  }

  handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookName: event.target.value })
  }

  handleAuthorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookAuthor: event.target.value })
  }

  handlePriceChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    this.setState({ newBookPrice: event.target.value })
  }

  onEditButtonClick = (bookId: string) => {
    this.props.history.push(`/books/${bookId}/edit`)
  }

  onBookCreate = async () => {
    console.log("onBookCreate !")
    try {
      const newBook = await createBook(this.props.auth.getIdToken(), {
        name: this.state.newBookName,
        author: this.state.newBookAuthor,
        price: this.state.newBookPrice
      })
      this.setState({
        books: [...this.state.books, newBook],
        newBookName: '',
        newBookAuthor: '',
        newBookPrice: ''
      })
    } catch {
      alert('Book creation failed')
    }
  }

  onBookDelete = async (bookId: string) => {
    try {
      await deleteBook(this.props.auth.getIdToken(), bookId)
      this.setState({
        books: this.state.books.filter(book => book.bookId != bookId)
      })
    } catch {
      alert('Book deletion failed')
    }
  }

  onBookCheck = async (pos: number) => {
    try {
      const book = this.state.books[pos]
      await patchBook(this.props.auth.getIdToken(), book.bookId, {
        sold: !book.sold
      })
      this.setState({
        books: update(this.state.books, {
          [pos]: { sold: { $set: !book.sold } }
        })
      })
    } catch {
      alert('Book update failed')
    }
  }

  async componentDidMount() {
    try {
      const books = await getBooks(this.props.auth.getIdToken())
      this.setState({
        books,
        loadingBooks: false
      })
    } catch (e) {
      alert(`Failed to fetch books: ${e.message}`)
    }
  }

  render() {
    return (
      <div>
        <Header as="h1">Own books</Header>

        {this.renderForm()}

        {this.renderDivider()}

        {this.renderBooks()}
      </div>
    )
  }

  renderForm() {
    return (
      <Form>
        <Form.Group onSubmit={this.onBookCreate}  widths='equal'>
          <Form.Input fluid label='Book name' value={this.state.newBookName} placeholder='Book name' onChange={this.handleNameChange} />
          <Form.Input fluid label='Author' value={this.state.newBookAuthor} placeholder='Author' onChange={this.handleAuthorChange}/>
          <Form.Input fluid label='Price' value={this.state.newBookPrice} placeholder='Price' onChange={this.handlePriceChange}/>
        </Form.Group>
        <Button onClick={this.onBookCreate} >Sell it!</Button>
      </Form>
    )
  }

  renderDivider() {
    return (
      <Grid padded>
        <Grid.Row>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
        <Grid.Column width={1}>
          Sold?
        </Grid.Column>
        <Grid.Column width={5} floated="right">
            Book name
        </Grid.Column>
        <Grid.Column width={5} floated="right">
            Author
        </Grid.Column>
        <Grid.Column width={3} floated="right">
            Price
        </Grid.Column>
        <Grid.Column width={2} floated="right">
        </Grid.Column>
        <Grid.Column width={16}>
          <Divider />
        </Grid.Column>
      </Grid.Row>
      </Grid>
    )
  }

  renderBooks() {
    if (this.state.loadingBooks) {
      return this.renderLoading()
    }

    return this.renderBooksList()
  }

  renderLoading() {
    return (
      <Grid.Row>
        <Loader indeterminate active inline="centered">
          Loading own books
        </Loader>
      </Grid.Row>
    )
  }

  renderBooksList() {
    return (
      <Grid padded>
        {this.state.books.map((book, pos) => {
          return (
            <Grid.Row key={book.bookId}>
              <Grid.Column width={1} verticalAlign="middle">
                <Checkbox
                  onChange={() => this.onBookCheck(pos)}
                  checked={book.sold}
                />
              </Grid.Column>
              <Grid.Column width={5} verticalAlign="middle">
                {book.name}
              </Grid.Column>
              <Grid.Column width={5} floated="right">
                {book.author}
              </Grid.Column>
              <Grid.Column width={3} floated="right">
                {book.price}
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="blue"
                  onClick={() => this.onEditButtonClick(book.bookId)}
                >
                  <Icon name="pencil" />
                </Button>
              </Grid.Column>
              <Grid.Column width={1} floated="right">
                <Button
                  icon
                  color="red"
                  onClick={() => this.onBookDelete(book.bookId)}
                >
                  <Icon name="delete" />
                </Button>
              </Grid.Column>
              {book.attachmentUrl && (
                <Image src={book.attachmentUrl} size="small" wrapped />
              )}
              <Grid.Column width={16}>
                <Divider />
              </Grid.Column>
            </Grid.Row>
          )
        })}
      </Grid>
    )
  }

}
