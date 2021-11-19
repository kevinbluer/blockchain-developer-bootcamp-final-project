import React from 'react';
import Card from 'react-bootstrap/Card';
import CardGroup from 'react-bootstrap/Card';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import InputGroup from 'react-bootstrap/InputGroup';
import FormControl from 'react-bootstrap/FormControl';
import 'bootstrap/dist/css/bootstrap.min.css';
import css from './MainHome.css';
import {Link} from "react-router-dom";


const MainHomeCards = (props) => {
   
    return (

      <div className="MainHomeCards">
        <Row xs={2}>
        <Col>
            <Link to="home">
            <Card
                bg="light"
                border="info"
                text="black"
            >
                <Card.Body>
                <Card.Text as="h5">
                    {props.text}
                </Card.Text><br/>
                </Card.Body>
                <Button 
                    variant="success"
                >
                   Enter
                </Button>
            </Card>
            </Link>
            </Col>
            <Col>
            <Link to="create-wallet">
            <Card
            bg="light"
            border="info"
            text="black"
            >
                <Card.Body>
                <Card.Text as="h5">
                    Create a new multi-signature wallet
                </Card.Text><br/>
                </Card.Body>
                <Button 
                    variant="warning"
                >
                   CREATE
                </Button>
             </Card>
             </Link>
            </Col>
        </Row>
    </div>
    );
  }
  

export default MainHomeCards;