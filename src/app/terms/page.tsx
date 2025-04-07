'use client';

import Link from 'next/link';
import { PageContainer } from '@/components/layout/page-container';

export default function TermsPage() {
  return (
    <PageContainer>
      <div className="max-w-3xl mx-auto py-8">
        <h1 className="text-2xl font-bold mb-6">利用規約</h1>

        <div className="prose max-w-none">
          <p className="mb-4">
            本利用規約（以下「本規約」といいます）は、LunchNow（以下「当サービス」といいます）の利用条件を定めるものです。
            ユーザーの皆様（以下「ユーザー」といいます）には、本規約に従って当サービスをご利用いただきます。
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">第1条（適用）</h2>
          <p className="mb-4">
            本規約は、ユーザーと当サービスの利用に関わる一切の関係に適用されるものとします。
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">第2条（利用登録）</h2>
          <p className="mb-4">
            当サービスは、慶應義塾大学日吉キャンパスの学生を対象としたサービスです。
            登録希望者が本規約に同意の上、当サービスの定める方法によって利用登録を申請し、当サービスがこれを承認することによって利用登録が完了するものとします。
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">第3条（禁止事項）</h2>
          <p className="mb-4">
            ユーザーは、当サービスの利用にあたり、以下の行為をしてはなりません。
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">法令または公序良俗に違反する行為</li>
            <li className="mb-2">犯罪行為に関連する行為</li>
            <li className="mb-2">当サービスの運営を妨害する行為</li>
            <li className="mb-2">他のユーザーに迷惑をかける行為</li>
            <li className="mb-2">他のユーザーに成りすます行為</li>
            <li className="mb-2">当サービスが許可しない広告、宣伝、勧誘行為</li>
            <li className="mb-2">面識のない異性との出会いを目的とした行為</li>
            <li className="mb-2">反社会的勢力に対する利益供与</li>
            <li className="mb-2">その他、当サービスが不適切と判断する行為</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3">第4条（サービス提供の停止等）</h2>
          <p className="mb-4">
            当サービスは、以下のいずれかの事由があると判断した場合、ユーザーに事前に通知することなく当サービスの全部または一部の提供を停止または中断することができるものとします。
          </p>
          <ul className="list-disc pl-6 mb-4">
            <li className="mb-2">当サービスにかかるシステムの保守点検または更新を行う場合</li>
            <li className="mb-2">地震、落雷、火災、停電または天災などの不可抗力により、当サービスの提供が困難となった場合</li>
            <li className="mb-2">その他、当サービスの提供が困難と判断した場合</li>
          </ul>

          <h2 className="text-xl font-semibold mt-6 mb-3">第5条（免責事項）</h2>
          <p className="mb-4">
            当サービスは、当サービスに関して、ユーザーと他のユーザーまたは第三者との間において生じた取引、連絡または紛争等について一切責任を負いません。
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">第6条（サービス内容の変更等）</h2>
          <p className="mb-4">
            当サービスは、ユーザーに通知することなく、当サービスの内容を変更または当サービスの提供を中止することができるものとし、これによってユーザーに生じた損害について一切の責任を負いません。
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">第7条（利用規約の変更）</h2>
          <p className="mb-4">
            当サービスは、必要と判断した場合には、ユーザーに通知することなく本規約を変更することができるものとします。
          </p>

          <h2 className="text-xl font-semibold mt-6 mb-3">第8条（準拠法・裁判管轄）</h2>
          <p className="mb-4">
            本規約の解釈にあたっては、日本法を準拠法とします。当サービスに関して紛争が生じた場合には、当サービスの本店所在地を管轄する裁判所を専属的合意管轄とします。
          </p>
        </div>
      </div>
    </PageContainer>
  );
}
