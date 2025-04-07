'use client';

import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';

export default function PrivacyPage() {
  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">プライバシーポリシー</h1>

        <div className="prose max-w-none">
          <p className="mb-4">
            LunchNow（以下、「当サービス」といいます）は、本ウェブサイト上で提供するサービスにおける、
            ユーザーの個人情報の取扱いについて、以下のとおりプライバシーポリシー（以下、「本ポリシー」といいます）を定めます。
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">第1条（個人情報）</h2>
          <p className="mb-4">
            「個人情報」とは、個人情報保護法にいう「個人情報」を指すものとし、生存する個人に関する情報であって、
            当該情報に含まれる氏名、生年月日、住所、電話番号、連絡先その他の記述等により特定の個人を識別できる情報及び容貌、
            指紋、声紋にかかるデータ、及び健康保険証の保険者番号などの当該情報単体から特定の個人を識別できる情報（個人識別情報）を指します。
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">第2条（個人情報の収集方法）</h2>
          <p className="mb-4">
            当サービスは、ユーザーが利用登録をする際に、ニックネーム、学年、学部を取得します。
            また、ランチの希望条件として、空き時間や希望場所などの情報を取得することがあります。
          </p>
          <p className="mb-4">
            これらの情報は、本人の同意なく第三者に提供することはありません。
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">第3条（個人情報を収集・利用する目的）</h2>
          <p className="mb-4">
            当サービスが個人情報を収集・利用する目的は、以下のとおりです。
          </p>
          <ol className="list-decimal pl-6 mb-4">
            <li className="mb-2">ランチ相手のマッチングサービスの提供のため</li>
            <li className="mb-2">ユーザーからのお問い合わせに回答するため</li>
            <li className="mb-2">サービスの改善や新機能の開発のため</li>
            <li className="mb-2">不正アクセス、不正利用の防止のため</li>
          </ol>

          <h2 className="text-xl font-semibold mt-6 mb-3">第4条（個人情報の第三者提供）</h2>
          <p className="mb-4">
            当サービスは、次に掲げる場合を除いて、あらかじめユーザーの同意を得ることなく、第三者に個人情報を提供することはありません。
            ただし、個人情報保護法その他の法令で認められる場合を除きます。
          </p>
          <ol className="list-decimal pl-6 mb-4">
            <li className="mb-2">法令に基づく場合</li>
            <li className="mb-2">人の生命、身体または財産の保護のために必要がある場合であって、本人の同意を得ることが困難であるとき</li>
            <li className="mb-2">公衆衛生の向上または児童の健全な育成の推進のために特に必要がある場合であって、本人の同意を得ることが困難であるとき</li>
            <li className="mb-2">国の機関もしくは地方公共団体またはその委託を受けた者が法令の定める事務を遂行することに対して協力する必要がある場合であって、本人の同意を得ることにより当該事務の遂行に支障を及ぼすおそれがあるとき</li>
          </ol>

          <h2 className="text-xl font-semibold mt-6 mb-3">第5条（個人情報の開示）</h2>
          <p className="mb-4">
            当サービスは、本人から個人情報の開示を求められたときは、本人に対し、遅滞なくこれを開示します。
            ただし、開示することにより次のいずれかに該当する場合は、その全部または一部を開示しないこともあり、
            開示しない決定をした場合には、その旨を遅滞なく通知します。
          </p>
          <ol className="list-decimal pl-6 mb-4">
            <li className="mb-2">本人または第三者の生命、身体、財産その他の権利利益を害するおそれがある場合</li>
            <li className="mb-2">当サービスの業務の適正な実施に著しい支障を及ぼすおそれがある場合</li>
            <li className="mb-2">その他法令に違反することとなる場合</li>
          </ol>

          <h2 className="text-xl font-semibold mt-6 mb-3">第6条（プライバシーポリシーの変更）</h2>
          <p className="mb-4">
            本ポリシーの内容は、法令その他本ポリシーに別段の定めのある事項を除いて、ユーザーに通知することなく、
            変更することができるものとします。当サービスが別途定める場合を除いて、変更後のプライバシーポリシーは、
            本ウェブサイトに掲載したときから効力を生じるものとします。
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">第7条（お問い合わせ窓口）</h2>
          <p className="mb-4">
            本ポリシーに関するお問い合わせは、下記の窓口までお願いいたします。<br />
            Eメールアドレス：lunchnow.keio@gmail.com
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
