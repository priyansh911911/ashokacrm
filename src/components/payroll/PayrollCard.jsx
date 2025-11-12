const PayrollCard = ({ payroll, staff }) => {
  const formatCurrency = (amount) => `₹${amount?.toLocaleString() || 0}`;

  return (
    <div className="bg-white rounded-lg shadow-md p-6 border">
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{staff?.name || 'Unknown Staff'}</h3>
        <p className="text-gray-600 text-sm">{staff?.department || 'Unknown Dept'} •</p>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-gray-500 text-sm">Total Salary</p>
          <p className="text-xl font-bold">{formatCurrency(payroll?.grossSalary)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Paid Days</p>
          <p className="text-xl font-bold">
            {payroll?.attendanceData?.presentDays || 0}/{payroll?.attendanceData?.totalDays || 0}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <p className="text-gray-500 text-sm">Deductions</p>
          <p className="text-xl font-bold text-red-600">{formatCurrency(payroll?.totalDeductions)}</p>
        </div>
        <div>
          <p className="text-gray-500 text-sm">Net Salary</p>
          <p className={`text-xl font-bold ${payroll?.netSalary < 0 ? 'text-red-600' : 'text-green-600'}`}>
            {formatCurrency(payroll?.netSalary)}
          </p>
        </div>
      </div>
    </div>
  );
};

export default PayrollCard;
