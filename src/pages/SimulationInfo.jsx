import React, { useEffect, useState } from "react";
import "./SimulationInfo.css";
import { useNavigate } from "react-router-dom";
import { constPath } from "../config.js";
import { toast } from "react-toastify";

const SimulationInfo = () => {
    const [rothOpt, setRothOpt] = React.useState(false);
    // const eventSeries = JSON.parse(localStorage.getItem("EventSeries"));
    // 이전에 유저가 eventSeries, Investments에서 작성했던 데이터들 불러올 것
    const [spendingStrategy, setSpendingStrategy] =useState([]);
    const [expenseWithdrawalStrategy, setExpenseWithdrawalStrategy] = useState([]);
    const [RMDStrategy, setRMDStrategy] = useState([]);
    // const [expenseWithdrawalStrategy, setExpenseWithdrawalStrategy] = useState(() => {
    //     const data = localStorage.getItem("expenseWithdrawalStrategy");
    //     return data ? JSON.parse(data) : [];
    // });
    // const [RMDStrategy, setRMDStrategy] = useState(() => {
    //     const data = localStorage.getItem("RMDStrategy");
    //     return data ? JSON.parse(data) : [];
    // });

    const [showModal, setShowModal] = useState(false);
    const openModal = () => setShowModal(true);
    const closeModal = () => setShowModal(false);
    const handleConfirm = () => {
        if (
            !spendingStrategy ||
            !expenseWithdrawalStrategy ||
            !RMDStrategy
        ) {
            toast.warning("Please Fill in all fields");
            return;
        }
        const updatedList = [...spendingStrategy, expenseWithdrawalStrategy, RMDStrategy];
        setSpendingStrategy(updatedList.spendingStrategy);
        setExpenseWithdrawalStrategy(updatedList.expenseWithdrawalStrategy);
        setRMDStrategy(updatedList.RMDStrategy);
        
        closeModal();
    }

    useEffect(() => {
        localStorage.setItem("spendingStrategy", JSON.stringify(spendingStrategy));
        localStorage.setItem("expenseWithdrawalStrategy", JSON.stringify(expenseWithdrawalStrategy));
        localStorage.setItem("RMDStrategy", JSON.stringify(RMDStrategy));
    }, [spendingStrategy, expenseWithdrawalStrategy, RMDStrategy]);

    const navigate = useNavigate();

    const handleBack = (e) => {
        e.preventDefault();
        navigate(`${constPath.overview}`);
    }

    const handleNext = (e) => {
        e.preventDefault();
        navigate();
    }

    return (
        <div className="SimulationInfo">
            <h2 style={{textAlign: "center", color: "white"}}>Information for Predict your Finance</h2>
            <div className="infoSection">
                <h3 style={{textAlign: "center"}}>What is Predict your Finance?</h3>
                <p style={{textAlign: "center", fontSize: "13px", color: "#444"}}>
                    Predict your Finance is a simulation tool that helps you understand the impact of different financial decisions on your future. 
                    It allows you to input various parameters and see how they affect your financial situation over time.
                </p>
                <section title="Inflation & Contribution">
                    <section className="Inflation">
                        <label>
                            Inflation Rate
                            <input 
                            type="number"
                            placeholder="e.g. 3" /> %
                        </label>
                    </section>
                    <section className="Contribution">
                        <label>
                            Tax-Free Retirement Account Annual Contribution Limit
                            <input 
                            type="number"
                            placeholder="e.g. 500" /> $
                        </label>
                    </section>
                </section>
                <section title="Spending & Withdrawal">
                    <section className="Spending">
                        {/* 이전에 유저가 작성했던 eventSeries에서 데이터를 불러올 것 
                        이 부분을 Add 버튼을 생성해서 모달 팝업을 띄운 뒤, 모달 팝업 내에서
                        유저가 입력한 데이터를 띄우고 선택해서 배열에 저장이 되게 하고,
                        이후에 confirm 버튼을 누르면 그 데이터가 저장이 되고 add버튼 옆에
                        체크 표시가 되게 설계 */}
                        <label>
                            Spending Strategy
                            <button className="addButton" onClick={openModal}>
                                Add
                            </button>
                            {showModal && (
                                <div className="modal-overlay" onClick={closeModal}>
                                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                                        <h4>Add Spending Strategy</h4>
                                        <select
                                        value={spendingStrategy}
                                        ></select>
                                        <button className="confirmButton" onClick={handleConfirm}>Confirm</button>
                                    </div>
                                </div>
                            )}    
                            
                        </label>
                    </section>
                    <section className="Withdrawal">
                        {/* Add 버튼을 생성해서 모달 팝업을 띄운 뒤, 모달 팝업 내에서
                        유저가 입력한 데이터를 띄우고 선택해서 배열에 저장이 되게 하고,
                        이후에 confirm 버튼을 누르면 그 데이터가 저장이 되고 add버튼 옆에
                        체크 표시가 되게 설계 */}
                        <label>
                            Withdrawal Strategy
                            <input 
                            type="number"
                            placeholder="e.g. 500" /> $
                        </label>
                    </section>
                </section>
                <section title="RMD Strategy & Enable Roth Conversion" className="RothOpt">
                    <section className="Withdrawal">
                        {/* Add 버튼을 생성해서 모달 팝업을 띄운 뒤, 모달 팝업 내에서
                        유저가 입력한 데이터를 띄우고 선택해서 배열에 저장이 되게 하고,
                        이후에 confirm 버튼을 누르면 그 데이터가 저장이 되고 add버튼 옆에
                        체크 표시가 되게 설계 */}
                        <label>
                            Source for Required Minimum Distributions (RMDs)
                            <input 
                            type="number"
                            placeholder="e.g. 500" /> $
                        </label>
                    </section>
                    <label> Optimaize Roth Conversions?
                        <input
                        id="rothOpt"
                        type="checkbox"
                        checked={rothOpt}
                        onChange={e => setRothOpt(e.target.checked)}
                        className="rothCheckbox"
                        />
                    </label>
                </section>
                <section title="Roth Conversion Start & End" className="RothStart">
                    <label> Roth Conversion Year: 
                        From <input
                        type="number" 
                        placeholder="e.g. 2050" /> 
                        <span style={{marginLeft: "20px"}}>To</span> 
                        <input
                        type="number" 
                        placeholder="e.g. 2050" />
                    </label>
                </section>
                <section title="Roth Conversion Strategy" className="RothStrategy">
                    {/* Investments에서 데이터 불러올 것 
                    이후, 유저가 선택하는데로 배열에 저장이 되게끔 설계 */}
                    <label> Roth Conversion Strategy
                        <input 
                        type="text"
                        placeholder="e.g. S&P 500" />
                    </label>
                </section>
                <section title="Financial Goals & Living State" className="FinancialGoals">
                    <label> Financial Goals
                        <input 
                        type="number"
                        placeholder="e.g. 10000" /> 
                    </label> 
                    <span style={{marginLeft: "10px", marginRight: "40px"}}>$</span>
                    <label> Living State
                        <input 
                        type="text"
                        placeholder="e.g. NY" />
                    </label>
                </section>
                <div className="form-buttons">
                    <button className="back" onClick={handleBack}>Back</button>
                    <button className="next" onClick={handleNext}>Next</button>
                </div>
            </div>
        </div>
    );
}

export default SimulationInfo;