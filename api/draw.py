import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
import os

TAG_MAC_XLSX_1 = 'E9-82-21-9E-C8-8F.xlsx'
TAG_MAC_XLSX_2 = 'EB-52-53-F5-D5-90.xlsx'

file_path = os.path.join(os.path.dirname(__file__), 'exports', TAG_MAC_XLSX_2)

data = pd.read_excel(file_path, usecols=['X', 'Y'])

x = data['X']
y = data['Y']

plt.xlim(-3, 14)
plt.ylim(-3, 14)

plt.scatter(x, y, label='Dữ liệu')
plt.xlabel('Trục X')
plt.ylabel('Trục Y')

plt.title('Biểu đồ Scatter Plot')

plt.legend()

plt.show()