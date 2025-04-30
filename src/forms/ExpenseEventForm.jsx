import React from 'react';
import './FormStyles.css';

export const initialExpenseEvent = {
  name: "",
  type: "expense",
  start: {
    type: "",
    value: null,
    eventSeries: "",
  },
  duration: {
    type: "fixed",
    value: null,
  },
  initialAmount: null,
  changeAmtOrPct: "",
  changeDistribution: {
    type: "fixed",
    value: null,
    lower: null,
    upper: null,
    mean: null,
    stdev: null,
  },
  inflationAdjusted: false,
  userFraction: null,
  discretionary: false,
};

const ExpenseEventForm = ({ newEvent, setNewEvent, incomeEvents }) => {
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setNewEvent(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleDistributionChange = (type, updates = {}) => {
    setNewEvent(prev => ({
      ...prev,
      changeDistribution: {
        type,
        ...updates
      }
    }));
  };

  return (
    <div className="form-container">
      <div className="form-section">
        <h3 className="section-title">기본 정보</h3>
        <div className="form-group">
          <label htmlFor="name">이름</label>
          <input
            type="text"
            id="name"
            name="name"
            value={newEvent.name}
            onChange={handleInputChange}
            className="form-input"
            placeholder="지출 이벤트 이름"
          />
        </div>

        <div className="form-group">
          <label htmlFor="start">시작 연도</label>
          <input
            type="number"
            id="start"
            name="start"
            value={newEvent.start}
            onChange={handleInputChange}
            className="form-input"
            placeholder="시작 연도를 입력하세요"
          />
        </div>

        <div className="form-group">
          <label htmlFor="duration">기간 (년)</label>
          <input
            type="number"
            id="duration"
            name="duration"
            value={newEvent.duration}
            onChange={handleInputChange}
            className="form-input"
            placeholder="기간을 입력하세요"
          />
        </div>
      </div>

      <div className="form-section">
        <h3 className="section-title">금액 상세</h3>
        <div className="form-group">
          <label htmlFor="amount">금액</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={newEvent.amount}
            onChange={handleInputChange}
            className="form-input"
            placeholder="금액을 입력하세요"
          />
        </div>

        <div className="form-group">
          <label htmlFor="distributionType">분포 유형</label>
          <select
            id="distributionType"
            className="form-select"
            value={newEvent.changeDistribution.type}
            onChange={(e) => handleDistributionChange(e.target.value)}
          >
            <option value="">분포 유형을 선택하세요</option>
            <option value="fixed">고정</option>
            <option value="normal">정규 분포</option>
            <option value="uniform">균등 분포</option>
          </select>
        </div>

        {newEvent.changeDistribution.type === 'fixed' && (
          <div className="form-group">
            <label htmlFor="fixedValue">고정 값</label>
            <input
              type="number"
              id="fixedValue"
              className="form-input"
              value={newEvent.changeDistribution.value || ''}
              onChange={(e) => handleDistributionChange('fixed', { value: parseFloat(e.target.value) || 0 })}
              placeholder="고정 값을 입력하세요"
            />
          </div>
        )}

        {newEvent.changeDistribution.type === 'normal' && (
          <>
            <div className="form-group">
              <label htmlFor="mean">평균</label>
              <input
                type="number"
                id="mean"
                className="form-input"
                value={newEvent.changeDistribution.mean || ''}
                onChange={(e) => handleDistributionChange('normal', {
                  mean: parseFloat(e.target.value) || 0,
                  stdev: newEvent.changeDistribution.stdev
                })}
                placeholder="평균값을 입력하세요"
              />
            </div>
            <div className="form-group">
              <label htmlFor="stdev">표준편차</label>
              <input
                type="number"
                id="stdev"
                className="form-input"
                value={newEvent.changeDistribution.stdev || ''}
                onChange={(e) => handleDistributionChange('normal', {
                  mean: newEvent.changeDistribution.mean,
                  stdev: parseFloat(e.target.value) || 0
                })}
                placeholder="표준편차를 입력하세요"
              />
            </div>
          </>
        )}

        {newEvent.changeDistribution.type === 'uniform' && (
          <>
            <div className="form-group">
              <label htmlFor="lower">하한값</label>
              <input
                type="number"
                id="lower"
                className="form-input"
                value={newEvent.changeDistribution.lower || ''}
                onChange={(e) => handleDistributionChange('uniform', {
                  lower: parseFloat(e.target.value) || 0,
                  upper: newEvent.changeDistribution.upper
                })}
                placeholder="하한값을 입력하세요"
              />
            </div>
            <div className="form-group">
              <label htmlFor="upper">상한값</label>
              <input
                type="number"
                id="upper"
                className="form-input"
                value={newEvent.changeDistribution.upper || ''}
                onChange={(e) => handleDistributionChange('uniform', {
                  lower: newEvent.changeDistribution.lower,
                  upper: parseFloat(e.target.value) || 0
                })}
                placeholder="상한값을 입력하세요"
              />
            </div>
          </>
        )}
      </div>

      <div className="form-section">
        <h3 className="section-title">추가 옵션</h3>
        <div className="toggle-group">
          <label>
            <span>물가 상승률 반영</span>
            <div className="toggle-switch">
              <input
                type="checkbox"
                name="inflationAdjusted"
                checked={newEvent.inflationAdjusted}
                onChange={handleInputChange}
              />
              <span className="toggle-slider"></span>
            </div>
          </label>
        </div>

        <div className="form-group">
          <label htmlFor="shareRatio">공유 비율</label>
          <input
            type="number"
            id="shareRatio"
            name="shareRatio"
            value={newEvent.shareRatio}
            onChange={handleInputChange}
            className="form-input"
            placeholder="공유 비율을 입력하세요"
            min="0"
            max="1"
            step="0.1"
          />
          <span className="input-hint">0과 1 사이의 값을 입력하세요</span>
        </div>
      </div>
    </div>
  );
};

export default ExpenseEventForm; 