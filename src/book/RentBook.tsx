import React, {ChangeEvent, FormEvent, useCallback, useEffect, useState} from 'react';
import {BookModel} from "./BookModel";
import axios from "axios";
import Modal from "react-modal";
import DatePicker from "react-datepicker";
import "../Buttons.css";
import "../Modals.css";
import "react-datepicker/dist/react-datepicker.css";
import {RentBookInfo} from "./RentBookInfo";
import * as Console from "console";

type RentBookProps = {
    book: BookModel;
    reloadAllBooks: () => void;
}

function RentBook(props: RentBookProps) {
    const [modalRentBookIsOpen, setModalRentBookIsOpen] = useState<boolean>(false)
    const openRentBookModal = useCallback(() => {
        setModalRentBookIsOpen(true)
    }, [])
    const closeRentBookModal = useCallback(() => {
        setModalRentBookIsOpen(false)
    }, [])

    const [names, setNames] = useState<string[]>([]);const fetchUsernames = useCallback(() => {
        axios.get("/api/app-users/getAllUsernamesWithoutLibrian")
            .then(response => {
                // Выполнить первое действие с данными, если необходимо
                const data = response.data;

                // Выполнить второе действие с данными, если необходимо
                // Например, установить в состояние или выполнить другую логику
                setNames(data);

                return data;
            })
            .catch(error => {
                // Обработка ошибки, если необходимо
                console.error("GET Error: " + error);
                throw error; // Прокидываем ошибку дальше, чтобы её можно было обработать в другом месте
            })
            .then(data => {
                // Выполнить третье действие с данными, если необходимо
                // Этот блок выполнится, независимо от успешного завершения или ошибки

                console.log("Additional action with data:", data);
            });
    }, []);

    useEffect(fetchUsernames, [fetchUsernames]);
    useEffect(() => {
        if (names.length > 0) {
            const initialRentByUsername = names[0];
            handleRentChangeUsername({
                target: { value: initialRentByUsername }
            } as React.ChangeEvent<HTMLSelectElement>);
        }
    }, [names]);

    function rentBookBy() {
        return <>
            {names.map(name => {
                return (
                    <option key={name} value={name}>{name}</option>
                )
            })}
        </>;
    }

    const [rentBookInfo, setRentBookInfo] = useState<RentBookInfo>({
        rentByUsername: names.length > 0 ? names[0] : '', // или null, если массив пуст
        rentUntil: new Date()
    });

    const handleRentBook = (event: FormEvent<HTMLFormElement>) => {
        event.preventDefault()
        axios.post("/api/books/rentBook/" + props.book.id, rentBookInfo)
            .catch(error => console.error("POST Error: " + error))
            .then(props.reloadAllBooks)
            .then(closeRentBookModal)
    }


    const handleRentChangeUsername = (event: ChangeEvent<HTMLSelectElement>) => {
        setRentBookInfo({
            ...rentBookInfo,
            rentByUsername: event.target.value
        });
    };

    const handleRentChangeDate = React.useCallback((date: Date) =>
        setRentBookInfo({
            ...rentBookInfo, "rentUntil": date
        }), [rentBookInfo])

    const handleCancelClick = useCallback(() => closeRentBookModal(), [closeRentBookModal]);

    function getIsbnForRentBook() {
        return <>
            {props.book.isbn.map(current => {
                return (
                    <>
                        <p key={current.identifier}>{current.type}: {current.identifier}</p>
                    </>

                )
            })
            }
        </>;
    }


    return <>
        <button className="button button-rent-book" type={"submit"} onClick={openRentBookModal}>Rent</button>
        <Modal className="modal"
               isOpen={modalRentBookIsOpen}
               onRequestClose={closeRentBookModal}
               contentLabel="Example Modal"
               ariaHideApp={false}
        >
            <span className="modal-heading">Rent book</span>
            <form onSubmit={handleRentBook}>
                <div className="modal-body">
                    <img className="modal-cover" src={props.book.cover} alt="cover"/><br/>
                    <h3 className="book-title">{props.book.title}</h3>
                    <p className="book-info">{props.book.author}</p>
                    <p className="book-info">{getIsbnForRentBook()}</p>
                    <p className="book-info">Category: {props.book.category}</p>
                    <p className="book-info">PrintType: {props.book.printType}</p>
                    <p className="book-info">PageCount: {props.book.pageCount}</p>

                </div>
                <br/>
                <label htmlFor="rentBy">RentBy:</label>

                <select
                    className="selector"
                    value={rentBookInfo.rentByUsername || ''}
                    name="rentByUsername"
                    id="rentByUsername"
                    onChange={handleRentChangeUsername}
                >
                    {rentBookBy()}
                </select>
                <p>Rent until:</p>
                <DatePicker selected={rentBookInfo.rentUntil} onChange={handleRentChangeDate} showTimeSelect
                            dateFormat="Pp"/>
                <br/><br/>
                <div className="modal-body">
                    <button className="button button-rent">Rent</button>
                    <button className="button button-cancel" onClick={handleCancelClick}>Cancel</button>
                </div>
            </form>
        </Modal>

    </>;
}

export default RentBook;